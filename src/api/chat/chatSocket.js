import { getAccessToken } from '../../auth/tokenStorage.js';
import { refreshAccessToken } from '../client-api.js';

const socketBaseUrl = import.meta.env.VITE_SOCKET_BASE_URL;

// 만료 직전 토큰으로 연결해 곧바로 끊기는 것을 막기 위한 여유 시간
const tokenExpiryLeewaySeconds = 30;

async function loadSocketDependencies() {
  if (!globalThis.global) {
    globalThis.global = globalThis;
  }

  const [{ Client, ReconnectionTimeMode }, sockJsModule] = await Promise.all([
    import('@stomp/stompjs'),
    import('sockjs-client'),
  ]);

  return {
    Client,
    ReconnectionTimeMode,
    SockJS: sockJsModule.default,
  };
}

function getTokenExpirySeconds(accessToken) {
  try {
    const payload = accessToken.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '=',
    );
    const decoded = JSON.parse(atob(paddedPayload));

    return typeof decoded?.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

/*
  exp를 읽을 수 없는 토큰은 만료로 보지 않는다.
  판단이 불확실할 땐 갱신을 건너뛰고 기존처럼 그대로 연결을 시도한다.
*/
function isTokenExpired(accessToken) {
  const expirySeconds = getTokenExpirySeconds(accessToken);
  if (expirySeconds === null) return false;

  return expirySeconds - tokenExpiryLeewaySeconds <= Date.now() / 1000;
}

export async function createChatStompClient({
  onConnect,
  onError,
  onDisconnect,
  onAuthFailure,
} = {}) {
  const { Client, ReconnectionTimeMode, SockJS } = await loadSocketDependencies();

  const client = new Client({
    webSocketFactory: () => new SockJS(`${socketBaseUrl}/ws/chat`),
    reconnectDelay: 5000,
    /*
      연결이 계속 실패할 때 5초 간격으로 무한히 재시도하면 서버와 토큰 갱신 요청이
      함께 폭주하므로 간격을 점점 늘린다. 연결에 성공하면 다시 5초로 초기화된다.
    */
    maxReconnectDelay: 30000,
    reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
    onConnect: () => {
      onConnect?.();
    },
    onStompError: (frame) => {
      onError?.(frame);
    },
    onWebSocketError: (event) => {
      onError?.(event);
    },
    onWebSocketClose: (event) => {
      onDisconnect?.(event);
    },
  });

  /*
    stompjs는 beforeConnect가 예외를 던지면 재연결을 예약하지 않고 클라이언트가
    조용히 멈춰버린다. 따라서 이 함수는 어떤 경우에도 예외를 밖으로 내보내지 않는다.
  */
  client.beforeConnect = async () => {
    let accessToken = getAccessToken();

    /*
      만료된 토큰으로 재연결하면 서버가 계속 거절해 무한 재연결에 빠진다.
      HTTP 요청이 없어도 소켓이 스스로 토큰을 갱신할 수 있어야 한다.
    */
    if (!accessToken || isTokenExpired(accessToken)) {
      try {
        accessToken = await refreshAccessToken();
      } catch (error) {
        /*
          네트워크 문제로 실패했다면 토큰이 그대로 남아 있으므로 일단 연결을 시도하고
          다음 재연결 때 다시 갱신한다. 토큰까지 지워졌다면 재인증이 필요한 상태이므로
          무의미한 재연결을 멈춘다.
        */
        accessToken = getAccessToken();

        if (!accessToken) {
          onAuthFailure?.(error);
          client.deactivate().catch(() => {});
          return;
        }
      }
    }

    client.connectHeaders = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};
  };

  return client;
}

export function parseStompBody(message) {
  try {
    return JSON.parse(message.body);
  } catch {
    return null;
  }
}

export function publishChatMessage(client, { roomId, message }) {
  client.publish({
    destination: '/app/chat/send',
    body: JSON.stringify({
      roomId,
      message,
    }),
  });
}
