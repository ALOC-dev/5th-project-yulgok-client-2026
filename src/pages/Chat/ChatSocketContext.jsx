import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUserId } from '../../api/auth/authStatus.js';
import { getTotalUnreadCount } from '../../api/chat/chat.js';
import {
  createChatStompClient,
  parseStompBody,
} from '../../api/chat/chatSocket.js';
import { chatNotificationEventName } from './chatNotificationEvents.js';

const ChatSocketContext = createContext(null);
const socketRetryDelay = 4000;
const maxSocketRetryCount = 3;
const manualReconnectNoticeDelay = 12000;
const toastVisibleDuration = 2800;
const toastSwipeDismissDistance = 105;
const toastExitDistance = 420;
const toastExitDuration = 180;
const toastDragResistance = 0.72;

function getNotificationRoomId(notification) {
  return notification?.roomId ?? notification?.chatRoomId ?? notification?.room?.roomId ?? null;
}

function getCurrentChatRoomId(pathname) {
  const match = pathname.match(/^\/chat\/(\d+)/);
  return match ? Number(match[1]) : null;
}

function getNotificationTitle(notification) {
  return notification?.senderName ||
    notification?.partnerName ||
    notification?.roomName ||
    '새 메시지';
}

function getNotificationMessage(notification) {
  return notification?.message ||
    notification?.lastMessage ||
    notification?.content ||
    '새 채팅 메시지가 도착했어요.';
}

function emitChatNotification(notification) {
  window.dispatchEvent(new CustomEvent(chatNotificationEventName, {
    detail: notification,
  }));
}

export function ChatSocketProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState(null);
  const [toastDragX, setToastDragX] = useState(0);
  const [isToastDragging, setIsToastDragging] = useState(false);
  const [toastExitDirection, setToastExitDirection] = useState(0);
  const [hasBeenDisconnectedTooLong, setHasBeenDisconnectedTooLong] = useState(false);
  const needsManualReconnect = !isConnected && hasBeenDisconnectedTooLong;

  const clientRef = useRef(null);
  const retryTimerRef = useRef(null);
  const retryCountRef = useRef(0);
  const reconnectNowRef = useRef(null);
  const notificationSubscriptionRef = useRef(null);
  const locationPathnameRef = useRef(location.pathname);
  const toastTimerRef = useRef(null);
  const toastPointerStartRef = useRef(null);
  const suppressToastClickRef = useRef(false);

  useEffect(() => {
    locationPathnameRef.current = location.pathname;
  }, [location.pathname]);

  const showChatToast = (notification) => {
    const roomId = getNotificationRoomId(notification);
    const currentRoomId = getCurrentChatRoomId(locationPathnameRef.current);

    if (roomId != null && Number(roomId) === currentRoomId) {
      return;
    }

    window.clearTimeout(toastTimerRef.current);
    setToastDragX(0);
    setToastExitDirection(0);
    setIsToastDragging(false);
    setToastNotification({
      ...notification,
      roomId,
    });
    toastTimerRef.current = window.setTimeout(() => {
      setToastNotification(null);
    }, toastVisibleDuration);
  };

  const dismissChatToast = ({ animate = false, direction = 1 } = {}) => {
    window.clearTimeout(toastTimerRef.current);

    if (!animate) {
      setToastNotification(null);
      setToastDragX(0);
      setToastExitDirection(0);
      setIsToastDragging(false);
      return;
    }

    setIsToastDragging(false);
    setToastExitDirection(direction);
    setToastDragX(direction * toastExitDistance);
    window.setTimeout(() => {
      setToastNotification(null);
      setToastDragX(0);
      setToastExitDirection(0);
    }, toastExitDuration);
  };

  const restartToastTimer = () => {
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      dismissChatToast({ animate: true, direction: 1 });
    }, toastVisibleDuration);
  };

  useEffect(() => {
    let isActive = true;

    function clearRetryTimer() {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    function scheduleRetry() {
      if (!isActive || retryTimerRef.current) return;
      if (retryCountRef.current >= maxSocketRetryCount) return;

      retryCountRef.current += 1;
      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null;
        connectGlobalChatSocket();
      }, socketRetryDelay);
    }

    async function connectGlobalChatSocket() {
      if (!isActive || clientRef.current) return;

      try {
        const userId = await getCurrentUserId();
        if (!isActive) return;

        /*
          오류가 없어도 userId를 못 받으면 소켓을 만들 수 없다.
          예전에는 여기서 조용히 끝나 새로고침 말고는 복구할 방법이 없었다.
        */
        if (!userId) {
          scheduleRetry();
          return;
        }

        setCurrentUserId(userId);

        getTotalUnreadCount()
          .then((count) => {
            if (isActive) setTotalUnreadCount(count);
          })
          .catch((error) => {
            console.info('전체 안 읽은 메시지 수를 불러오지 못했습니다.', error);
          });

        const stompClient = await createChatStompClient({
          onConnect: () => {
            retryCountRef.current = 0;
            setIsConnected(true);
            notificationSubscriptionRef.current?.unsubscribe();
            notificationSubscriptionRef.current = stompClient.subscribe(`/queue/user/${userId}`, (message) => {
              const notification = parseStompBody(message);
              if (!notification) return;

              setTotalUnreadCount(Number(notification.totalUnreadCount) || 0);
              emitChatNotification(notification);
              showChatToast(notification);
            });
          },
          onError: (error) => {
            console.error('전역 채팅 WebSocket 오류가 발생했습니다.', error);
            setIsConnected(false);
          },
          onDisconnect: () => {
            setIsConnected(false);
          },
          onAuthFailure: () => {
            // 재인증이 필요한 상태. AuthContext가 로그인 화면으로 보낸다.
            setIsConnected(false);
          },
        });

        if (!isActive) {
          stompClient.deactivate();
          return;
        }

        clientRef.current = stompClient;
        setClient(stompClient);
        stompClient.activate();
      } catch (error) {
        console.error('전역 채팅 WebSocket 연결을 시작하지 못했습니다.', error);
        scheduleRetry();
      }
    }

    function reconnectNow() {
      if (!isActive) return;

      const currentClient = clientRef.current;

      // 소켓을 아직 만들지 못했으면 초기 연결부터 다시 시도
      if (!currentClient) {
        clearRetryTimer();
        retryCountRef.current = 0;
        connectGlobalChatSocket();
        return;
      }

      /*
        이미 붙어 있거나 stompjs가 재연결을 진행 중이면 건드리지 않는다.
        모바일에서는 화면 전환마다 visibilitychange가 발생하므로 이 조건이 필요하다.
      */
      if (currentClient.connected || currentClient.active) return;

      retryCountRef.current = 0;
      currentClient.activate();
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return;
      reconnectNow();
    }

    reconnectNowRef.current = reconnectNow;
    connectGlobalChatSocket();

    /*
      절전이나 백그라운드에서 돌아왔을 때 즉시 재연결한다.
      이게 없으면 화면을 켜고도 재연결 주기만큼 먹통으로 남는다.
    */
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', reconnectNow);

    return () => {
      isActive = false;
      reconnectNowRef.current = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', reconnectNow);
      clearRetryTimer();
      notificationSubscriptionRef.current?.unsubscribe();
      notificationSubscriptionRef.current = null;
      window.clearTimeout(toastTimerRef.current);
      clientRef.current?.deactivate();
      clientRef.current = null;
      setClient(null);
    };
  }, []);

  // 연결이 오래 끊겨 있으면 수동으로 다시 시도할 수 있게 한다.
  useEffect(() => {
    if (isConnected) return undefined;

    const noticeTimer = window.setTimeout(() => {
      setHasBeenDisconnectedTooLong(true);
    }, manualReconnectNoticeDelay);

    return () => {
      window.clearTimeout(noticeTimer);
      setHasBeenDisconnectedTooLong(false);
    };
  }, [isConnected]);

  const value = useMemo(() => ({
    client,
    currentUserId,
    isConnected,
    totalUnreadCount,
    refreshTotalUnreadCount: async () => {
      const count = await getTotalUnreadCount();
      setTotalUnreadCount(count);
      return count;
    },
  }), [client, currentUserId, isConnected, totalUnreadCount]);

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
      {needsManualReconnect && (
        <div className="pointer-events-none fixed inset-x-0 top-5 z-[70] flex justify-center px-5">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-white py-2 pl-4 pr-2 shadow-[0_10px_30px_rgba(21,48,92,0.18)] ring-1 ring-[#dbe5f2]">
            <span className="text-xs text-fg-basic-muted">채팅 연결이 끊겼어요.</span>
            <button
              type="button"
              className="rounded-full px-3 py-1 text-xs font-bold text-brand-primary transition-colors hover:bg-brand-primary/10"
              onClick={() => reconnectNowRef.current?.()}
            >
              다시 연결
            </button>
          </div>
        </div>
      )}
      {toastNotification && (
        <button
          type="button"
          className={`fixed right-5 top-5 z-[80] flex w-[min(320px,calc(100vw-40px))] touch-pan-y select-none flex-col gap-1 rounded-xl bg-white px-4 py-3 text-left shadow-[0_10px_30px_rgba(21,48,92,0.18)] ring-1 ring-[#dbe5f2] ${
            !isToastDragging || toastExitDirection ? 'transition-[transform,opacity] duration-[180ms] ease-out' : ''
          }`}
          style={{
            opacity: Math.max(0.42, 1 - Math.abs(toastDragX) / toastExitDistance),
            transform: `translateX(${toastDragX}px) rotate(${toastDragX / 28}deg)`,
          }}
          onPointerDown={(event) => {
            if (toastExitDirection) return;
            window.clearTimeout(toastTimerRef.current);
            toastPointerStartRef.current = {
              x: event.clientX,
            };
            suppressToastClickRef.current = false;
            setIsToastDragging(true);
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const startPoint = toastPointerStartRef.current;
            if (!startPoint || toastExitDirection) return;
            setToastDragX((event.clientX - startPoint.x) * toastDragResistance);
          }}
          onPointerUp={() => {
            const startPoint = toastPointerStartRef.current;
            toastPointerStartRef.current = null;
            setIsToastDragging(false);
            if (!startPoint) return;

            const movedX = Math.abs(toastDragX);

            if (movedX >= toastSwipeDismissDistance) {
              suppressToastClickRef.current = true;
              dismissChatToast({
                animate: true,
                direction: toastDragX >= 0 ? 1 : -1,
              });
              return;
            }

            setToastDragX(0);
            restartToastTimer();
          }}
          onPointerCancel={() => {
            toastPointerStartRef.current = null;
            setIsToastDragging(false);
            setToastDragX(0);
            restartToastTimer();
          }}
          onClick={(event) => {
            if (suppressToastClickRef.current) {
              event.preventDefault();
              suppressToastClickRef.current = false;
              return;
            }

            dismissChatToast();
            if (toastNotification.roomId != null) {
              navigate(`/chat/${toastNotification.roomId}`);
            }
          }}
        >
          <span className="text-xs font-bold text-fg-primary">{getNotificationTitle(toastNotification)}</span>
          <span className="line-clamp-2 text-xs text-fg-basic-muted">{getNotificationMessage(toastNotification)}</span>
        </button>
      )}
    </ChatSocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChatSocket() {
  const context = useContext(ChatSocketContext);

  if (!context) {
    return {
      client: null,
      currentUserId: null,
      isConnected: false,
      totalUnreadCount: 0,
      refreshTotalUnreadCount: async () => 0,
    };
  }

  return context;
}
