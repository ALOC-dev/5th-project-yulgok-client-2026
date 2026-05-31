export const mockUser = {
  name: '박강현',
  department: '컴퓨터과학부',
  year: '22학번',
  stats: { chats: 4, liked: 8, likedBy: 12 },
}

export const mockMatch = {
  name: '종황',
  age: 25,
  department: '컴퓨터과학부',
  year: '22학번',
  matchRate: 92,
  tags: ['🏛 도서관', '청결 ★', '운동 주 3회'],
  likedMe: true,
}

export const mockMessages = [
  { id: 1, from: 'other', text: '안녕하세요! 매칭 메시지 보고 답장 드려요 :)', time: '14:02' },
  { id: 2, from: 'other', text: '지도 컴퓨터과학부 22라 반갑네요', time: '14:02' },
  { id: 3, from: 'me', text: '안녕하세요! 답장 빨라서 기뻐요 ㅎ ㅎ', time: '14:05' },
  { id: 4, from: 'me', text: '혹시 다음주에 잠깐 카페에서 얘기 가능하세요?', time: '14:09' },
  { id: 5, from: 'other', text: '좋아요! 화요일 4시에 풋살 한 판 어떠세요?', time: '14:11' },
]

export const mockPosts = [
  {
    id: 1,
    category: '공지',
    title: '5월 단수 안내 (5/22 02~05시)',
    content: '배수 공사로 인해 한 차례 단수가 진행됩니다. 미리 물 받아 두세요.',
    author: '관리자',
    time: '2시간 전',
    likes: 4,
    comments: 12,
    pinned: true,
  },
  {
    id: 2,
    category: '일반',
    title: '기숙사 헬스장 운영시간 바뀐 거 아세요?',
    content: '이번 학기부터 평일 23시까지로 연장됐어요. 새벽 운동하려 했더니… 그래도 아이러니 아어이 그래도.',
    author: '익명',
    time: '4시간 전',
    likes: 28,
    comments: 9,
  },
  {
    id: 3,
    category: '장터',
    title: '에어팟 프로 2세대 거의 새 것',
    price: 170000,
    content: '12월에 구매. 케이스 박스 다 있어요. 음질 그대로.',
    author: '익명',
    time: '5시간 전',
    likes: 11,
    comments: 3,
    hasImage: true,
  },
  {
    id: 4,
    category: '장터',
    title: '이어폰 팔아요',
    price: 12000,
    content: '거의 안 씀',
    author: '익명',
    time: '5시간 전',
    likes: 2,
    comments: 1,
    hasImage: true,
  },
]

export const mockComments = [
  {
    id: 1,
    author: '익명2218',
    floor: '자유관 5층',
    time: '1시간 전',
    text: '저요! 페이스 비슷할 거 같아요. 7시 어디 모일까요?',
    likes: 2,
    replies: [
      {
        id: 11,
        author: '글쓴이',
        time: '50분 전',
        text: '정문 분수대 앞 어떠세요? 거기서 시작해서 한 바퀴 돌아요',
        likes: 1,
      },
    ],
  },
  {
    id: 2,
    author: '익명1009',
    time: '22분 전',
    text: '저도 참여 가능할까요?',
    likes: 0,
    replies: [],
  },
]
