import { useCallback, useEffect, useState } from 'react';
import { getChatErrorMessage, getChatRooms } from '../../api/chat/chat.js';
import { chatNotificationEventName } from './chatNotificationEvents.js';
import ChatList from './components/ChatList.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.js';
import MainPageLayout from '../../layout/MainPageLayout.js';

function Chat() {
  const [chatRooms, setChatRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadChatRooms = useCallback(async ({ showLoading = false } = {}) => {
    try {
      if (showLoading) setIsLoading(true);
      setErrorMessage('');
      const rooms = await getChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      console.error('채팅방 목록을 불러오지 못했습니다.', error);
      setErrorMessage(getChatErrorMessage(error, '채팅방 목록을 불러오지 못했어요.'));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialChatRooms() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const rooms = await getChatRooms();

        if (isMounted) {
          setChatRooms(rooms);
        }
      } catch (error) {
        console.error('채팅방 목록을 불러오지 못했습니다.', error);

        if (isMounted) {
          setErrorMessage(getChatErrorMessage(error, '채팅방 목록을 불러오지 못했어요.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialChatRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleChatNotification() {
      loadChatRooms();
    }

    window.addEventListener(chatNotificationEventName, handleChatNotification);
    return () => {
      window.removeEventListener(chatNotificationEventName, handleChatNotification);
    };
  }, [loadChatRooms]);

  return (
    <MainPageLayout
      title="채팅"
      description="서로 하트를 보낸 유저와 채팅할 수 있어요."
    >
      <main className="mt-3">
        {isLoading && (
          <div className="flex justify-center py-20 text-brand-primary">
            <LoadingSpinner label="채팅방을 불러오는 중입니다." />
          </div>
        )}

        {!isLoading && errorMessage && (
          <p className="py-20 text-center text-sm text-fg-basic-muted" role="alert">
            {errorMessage}
          </p>
        )}

        {!isLoading && !errorMessage && chatRooms.length === 0 && (
          <div className="mx-auto mt-24 max-w-[320px] rounded-2xl bg-white px-5 py-6 text-center shadow-sm">
            <p className="font-heading text-base font-extrabold text-fg-primary">아직 만들어진 채팅방이 없어요.</p>
            <p className="mt-2 text-sm leading-6 text-fg-basic-muted">
              서로 하트를 주고받으면 이곳에 채팅방이 표시돼요.
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && chatRooms.length > 0 && <ChatList chatRooms={chatRooms} />}
      </main>
    </MainPageLayout>
  );
}

export default Chat;
