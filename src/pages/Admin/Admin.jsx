import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  approveCertification,
  banUser,
  certificationStatuses,
  getAdminCertification,
  getAdminCertifications,
  getAdminErrorMessage,
  getAdminMonitoringSummary,
  getAdminUser,
  getAdminUsers,
  getCurrentUser,
  getMatchingConfig,
  rejectCertification,
  unbanUser,
  updateMatchingConfig,
} from '../../api/admin/admin.js';
import LoadingSpinner from '../../components/LoadingSpinner.js';
import { getProfileImageUrl } from '../../utils/profileImage.js';

const tabs = [
  { id: 'users', label: '회원 관리' },
  { id: 'certifications', label: '인증 요청' },
  { id: 'match', label: '매칭 날짜' },
  { id: 'monitoring', label: '모니터링' },
];

const userPageSize = 20;
const userRoleOptions = ['ADMIN', 'USER', 'GUEST'];
const userStatusOptions = ['ACTIVE', 'PENDING', 'BANNED', 'WITHDRAWN'];
const userGenderOptions = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];
const userSortOptions = [
  { value: 'role', label: '권한순' },
  { value: 'status', label: '상태순' },
  { value: 'name', label: '이름순' },
];
const userRolePriority = {
  ADMIN: 0,
  USER: 1,
  GUEST: 2,
};
const userStatusPriority = {
  ACTIVE: 0,
  PENDING: 1,
  BANNED: 2,
  WITHDRAWN: 3,
};

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusStyle(status) {
  const styles = {
    ACTIVE: 'bg-[#e5f4ed] text-[#21724f]',
    BANNED: 'bg-[#fde8ec] text-[#b42345]',
    WITHDRAWN: 'bg-[#edf0f4] text-[#6e7b92]',
    PENDING: 'bg-[#fff4d8] text-[#9a6700]',
    REQUESTED: 'bg-[#fff4d8] text-[#9a6700]',
    APPROVED: 'bg-[#e5f4ed] text-[#21724f]',
    REJECTED: 'bg-[#fde8ec] text-[#b42345]',
    ADMIN: 'bg-[#e8edff] text-[#254ba2]',
    USER: 'bg-[#edf0f4] text-[#3e4a5e]',
    GUEST: 'bg-[#f4eefc] text-[#7047a5]',
  };

  return styles[status] ?? 'bg-[#edf0f4] text-[#3e4a5e]';
}

function StatusPill({ value }) {
  return (
    <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 text-[11px] font-extrabold ${getStatusStyle(value)}`}>
      {value ?? '-'}
    </span>
  );
}

function FallbackAvatar({ src, name }) {
  const initial = name?.trim()?.[0] ?? '?';
  const imageUrl = getProfileImageUrl(src, '');
  const [hasImageError, setHasImageError] = useState(false);

  if (imageUrl && !hasImageError) {
    return (
      <img
        className="h-10 w-10 rounded-full bg-ui-sub object-cover"
        src={imageUrl}
        alt={`${name} 프로필`}
        onError={() => setHasImageError(true)}
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ui-sub text-sm font-extrabold text-fg-primary">
      {initial}
    </div>
  );
}

function SectionMessage({ children, tone = 'default' }) {
  const toneClass = tone === 'error'
    ? 'border-[#f2b8c3] bg-[#fff1f3] text-[#a83f57]'
    : 'border-[#d9e3f0] bg-white/70 text-fg-basic-muted';

  return (
    <p className={`rounded-lg border px-4 py-3 text-sm font-semibold ${toneClass}`}>
      {children}
    </p>
  );
}

function MetricCard({ label, value, tone = 'default' }) {
  const toneClass = tone === 'accent'
    ? 'border-[#cbd8ff] bg-[#f2f5ff]'
    : 'border-[#d9e3f0] bg-white';

  return (
    <div className={`rounded-lg border px-4 py-4 shadow-sm ${toneClass}`}>
      <p className="text-xs font-extrabold text-fg-basic-muted">{label}</p>
      <p className="mt-2 font-heading text-2xl font-extrabold text-fg-primary">{Number(value) || 0}</p>
    </div>
  );
}

function MetricGroup({ metrics, title }) {
  return (
    <section className="rounded-lg border border-[#d9e3f0] bg-white/50 p-4">
      <h3 className="text-sm font-extrabold text-fg-primary">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </div>
    </section>
  );
}

function getRatioValue(value, total) {
  const numericValue = Number(value) || 0;
  const numericTotal = Number(total) || 0;
  if (numericTotal <= 0) return 0;
  return Math.min(100, Math.round((numericValue / numericTotal) * 100));
}

function RatioBar({ label, value, total }) {
  const ratio = getRatioValue(value, total);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3 text-xs font-bold">
        <span className="text-fg-basic-muted">{label}</span>
        <span className="text-fg-primary">{Number(value) || 0} / {Number(total) || 0}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e5ecf6]">
        <div
          className="h-full rounded-full bg-brand-primary"
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

function MonitoringVisualSummary({ chat, matching }) {
  const heartSent = Number(matching.heartSent) || 0;
  const heartMatched = Number(matching.heartMatched) || 0;
  const finalConfirmed = Number(matching.finalConfirmed) || 0;
  const totalRooms = Number(chat.totalRooms) || 0;
  const openRooms = Number(chat.openRooms) || 0;
  const closedRooms = Number(chat.closedRooms) || 0;

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-[#d9e3f0] bg-white p-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-fg-primary">매칭 전환 흐름</h3>
        <div className="mt-4 flex flex-col gap-4">
          <RatioBar label="서로 하트 매칭" total={heartSent} value={heartMatched} />
          <RatioBar label="최종확정 완료" total={heartMatched} value={finalConfirmed} />
        </div>
      </div>

      <div className="rounded-lg border border-[#d9e3f0] bg-white p-4 shadow-sm">
        <h3 className="text-sm font-extrabold text-fg-primary">채팅방 상태 비율</h3>
        <div className="mt-4 flex flex-col gap-4">
          <RatioBar label="열린 채팅방" total={totalRooms} value={openRooms} />
          <RatioBar label="닫힌 채팅방" total={totalRooms} value={closedRooms} />
        </div>
      </div>
    </section>
  );
}

function getUserDetail(user) {
  return user?.detail ?? user?.details ?? user?.userDetail ?? {};
}

function getUserId(user) {
  return user?.userId ?? user?.id ?? '-';
}

function getUserRealName(user) {
  const detail = getUserDetail(user);
  return user?.realName ?? user?.name ?? detail.realName ?? detail.name ?? '';
}

function getUserNickname(user) {
  return user?.nickname ?? user?.profile?.nickname ?? '';
}

function getUserDisplayName(user) {
  return getUserNickname(user) || getUserRealName(user) || '-';
}

function getUserSecondaryName(user) {
  const nickname = getUserNickname(user);
  const realName = getUserRealName(user);

  if (nickname && realName && nickname !== realName) return realName;
  return '';
}

function compareUserName(userA, userB) {
  return getUserDisplayName(userA).localeCompare(getUserDisplayName(userB), 'ko-KR');
}

function getUserGender(user) {
  const detail = getUserDetail(user);
  return user?.gender ?? detail?.gender ?? '';
}

function sortAdminUsers(users, sortKey) {
  return [...users].sort((userA, userB) => {
    if (sortKey === 'role') {
      const roleDifference =
        (userRolePriority[userA.role] ?? 99) - (userRolePriority[userB.role] ?? 99);
      return roleDifference || compareUserName(userA, userB);
    }

    if (sortKey === 'status') {
      const statusDifference =
        (userStatusPriority[userA.status] ?? 99) - (userStatusPriority[userB.status] ?? 99);
      return statusDifference || compareUserName(userA, userB);
    }

    if (sortKey === 'name') {
      return compareUserName(userA, userB);
    }

    return compareUserName(userA, userB);
  });
}

function filterAdminUsers(users, { gender, role, status }) {
  return users.filter((user) => (
    (!role || user.role === role) &&
    (!status || user.status === status) &&
    (!gender || getUserGender(user) === gender)
  ));
}

function getUserDetailValue(user, key) {
  const detail = getUserDetail(user);
  return user?.[key] ?? detail?.[key] ?? '-';
}

function getCertificationUserName(certification) {
  const realName = (
    certification?.userRealName ??
    certification?.realName ??
    certification?.name ??
    certification?.user?.realName ??
    certification?.user?.name ??
    certification?.detail?.realName ??
    ''
  );
  const nickname = (
    certification?.userNickname ??
    certification?.nickname ??
    certification?.user?.nickname ??
    ''
  );

  if (nickname && realName && nickname !== realName) return `${nickname} (${realName})`;
  return nickname || realName || certification?.userId || '-';
}

function DetailRow({ label, value }) {
  return (
    <>
      <dt className="font-bold text-fg-basic-muted">{label}</dt>
      <dd className="min-w-0 break-words text-fg-basic">{value || '-'}</dd>
    </>
  );
}

function AdminUserDetailPanel({ errorMessage, isLoading, user }) {
  if (!user) {
    return (
      <aside className="rounded-lg border border-[#d9e3f0] bg-white p-4">
        <p className="py-16 text-center text-sm text-fg-basic-muted">
          회원을 선택하면 상세 정보가 보여요.
        </p>
      </aside>
    );
  }

  const realName = getUserRealName(user);
  const nickname = getUserNickname(user);

  return (
    <aside className="rounded-lg border border-[#d9e3f0] bg-white p-4">
      <div className="flex items-center gap-3">
        <FallbackAvatar src={user.profileImageUrl} name={getUserDisplayName(user)} />
        <div className="min-w-0">
          <h3 className="truncate font-extrabold text-fg-primary">
            {nickname || realName || '이름 없음'}
          </h3>
          <p className="text-xs text-fg-basic-muted">{getUserId(user)}</p>
        </div>
      </div>

      {isLoading && (
        <div className="mt-5 flex justify-center py-4 text-brand-primary">
          <LoadingSpinner label="회원 상세 정보를 불러오는 중입니다." size="sm" />
        </div>
      )}

      {errorMessage && (
        <p className="mt-5 rounded-lg border border-[#f2b8c3] bg-[#fff1f3] px-3 py-2 text-xs font-semibold text-[#a83f57]">
          {errorMessage}
        </p>
      )}

      <dl className="mt-5 grid grid-cols-[82px_1fr] gap-x-3 gap-y-2 text-sm">
        <DetailRow label="닉네임" value={nickname} />
        <DetailRow label="실명" value={realName} />
        <DetailRow label="이메일" value={user.email} />
        <DetailRow label="전화번호" value={getUserDetailValue(user, 'phoneNumber')} />
        <DetailRow label="학번" value={getUserDetailValue(user, 'studentId')} />
        <DetailRow label="학과" value={getUserDetailValue(user, 'department')} />
        <DetailRow label="나이" value={getUserDetailValue(user, 'age')} />
        <DetailRow label="성별" value={getUserDetailValue(user, 'gender')} />
        <DetailRow label="가입일" value={formatDateTime(user.createdAt)} />
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusPill value={user.role} />
        <StatusPill value={user.status} />
        {user.certificationStatus && <StatusPill value={user.certificationStatus} />}
      </div>
    </aside>
  );
}

function AdminUsersPanel({ currentUser }) {
  const [usersData, setUsersData] = useState({
    users: [],
    page: 0,
    size: userPageSize,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);
  const [userDetailErrorMessage, setUserDetailErrorMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [sortKey, setSortKey] = useState('role');
  const selectedUserRequestIdRef = useRef(0);

  const loadUsers = useCallback(async (page) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await getAdminUsers({ page, size: userPageSize });
      setUsersData(data);
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, '회원 목록을 불러오지 못했어요.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUsers() {
      try {
        const data = await getAdminUsers({ page: 0, size: userPageSize });
        if (!isMounted) return;

        setUsersData(data);
        setErrorMessage('');
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getAdminErrorMessage(error, '회원 목록을 불러오지 못했어요.'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInitialUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleToggleBan(user) {
    if (!user?.userId || actionUserId) return;

    try {
      setActionUserId(user.userId);
      setErrorMessage('');
      const updatedUser = user.status === 'BANNED'
        ? await unbanUser(user.userId)
        : await banUser(user.userId);

      if (updatedUser) {
        setUsersData((currentData) => ({
          ...currentData,
          users: currentData.users.map((item) => (
            item.userId === updatedUser.userId ? updatedUser : item
          )),
        }));
        setSelectedUser((currentSelectedUser) => (
          currentSelectedUser?.userId === updatedUser.userId
            ? { ...currentSelectedUser, ...updatedUser }
            : currentSelectedUser
        ));
      }
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, '회원 상태를 변경하지 못했어요.'));
    } finally {
      setActionUserId('');
    }
  }

  async function handleSelectUser(user) {
    const userId = getUserId(user);
    if (!userId || userId === '-') return;

    const requestId = selectedUserRequestIdRef.current + 1;
    selectedUserRequestIdRef.current = requestId;
    setSelectedUser(user);
    setIsUserDetailLoading(true);
    setUserDetailErrorMessage('');

    try {
      const detail = await getAdminUser(userId);
      if (selectedUserRequestIdRef.current !== requestId) return;

      setSelectedUser(detail ? { ...user, ...detail } : user);
    } catch (error) {
      if (selectedUserRequestIdRef.current !== requestId) return;

      setUserDetailErrorMessage(getAdminErrorMessage(error, '회원 상세 정보를 불러오지 못했어요.'));
    } finally {
      if (selectedUserRequestIdRef.current === requestId) {
        setIsUserDetailLoading(false);
      }
    }
  }

  const currentUserId = currentUser?.id ?? currentUser?.userId;
  const displayedUsers = useMemo(() => (
    sortAdminUsers(
      filterAdminUsers(usersData.users, {
        gender: genderFilter,
        role: roleFilter,
        status: statusFilter,
      }),
      sortKey,
    )
  ), [genderFilter, roleFilter, sortKey, statusFilter, usersData.users]);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-fg-primary">회원 관리</h2>
          <p className="text-sm text-fg-basic-muted">회원 상태를 확인하고 제재 여부를 변경해요.</p>
        </div>
        <button
          type="button"
          className="min-h-10 rounded-full border border-[#d7e1ef] bg-white px-4 text-sm font-extrabold text-fg-primary disabled:opacity-60"
          disabled={isLoading}
          onClick={() => loadUsers(usersData.page)}
        >
          새로고침
        </button>
      </div>

      {errorMessage && <SectionMessage tone="error">{errorMessage}</SectionMessage>}

      <div className="grid gap-2 rounded-lg border border-[#d9e3f0] bg-white p-3 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs font-extrabold text-fg-basic-muted">
          권한
          <select
            className="min-h-10 rounded-lg border border-[#d7e1ef] bg-[#f8fbff] px-3 text-sm font-bold text-fg-primary outline-none focus:border-brand-primary"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="">전체</option>
            {userRoleOptions.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold text-fg-basic-muted">
          상태
          <select
            className="min-h-10 rounded-lg border border-[#d7e1ef] bg-[#f8fbff] px-3 text-sm font-bold text-fg-primary outline-none focus:border-brand-primary"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">전체</option>
            {userStatusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold text-fg-basic-muted">
          성별
          <select
            className="min-h-10 rounded-lg border border-[#d7e1ef] bg-[#f8fbff] px-3 text-sm font-bold text-fg-primary outline-none focus:border-brand-primary"
            value={genderFilter}
            onChange={(event) => setGenderFilter(event.target.value)}
          >
            <option value="">전체</option>
            {userGenderOptions.map((gender) => (
              <option key={gender.value} value={gender.value}>{gender.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-extrabold text-fg-basic-muted">
          정렬
          <select
            className="min-h-10 rounded-lg border border-[#d7e1ef] bg-[#f8fbff] px-3 text-sm font-bold text-fg-primary outline-none focus:border-brand-primary"
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            {userSortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#d9e3f0] bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full border-collapse text-left text-sm">
            <thead className="bg-[#f5f8fc] text-xs font-extrabold text-fg-basic-muted">
              <tr>
                <th className="px-4 py-3">회원</th>
                <th className="px-4 py-3">권한</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">가입일</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td className="px-4 py-8 text-center text-fg-basic-muted" colSpan={5}>
                    <LoadingSpinner label="회원 목록을 불러오는 중입니다." />
                  </td>
                </tr>
              )}

              {!isLoading && usersData.users.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-fg-basic-muted" colSpan={5}>
                    조회된 회원이 없어요.
                  </td>
                </tr>
              )}

              {!isLoading && usersData.users.length > 0 && displayedUsers.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-fg-basic-muted" colSpan={5}>
                    현재 페이지에 조건과 일치하는 회원이 없어요.
                  </td>
                </tr>
              )}

              {!isLoading && displayedUsers.map((user) => {
                const isSelf = String(user.userId) === String(currentUserId);
                const isBanned = user.status === 'BANNED';

                return (
                  <tr
                    key={user.userId}
                    className={`cursor-pointer border-t border-[#edf1f7] ${
                      getUserId(selectedUser) === getUserId(user) ? 'bg-[#f5f8fc]' : ''
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FallbackAvatar src={user.profileImageUrl} name={getUserDisplayName(user)} />
                        <div className="min-w-0">
                          <p className="font-extrabold text-fg-basic">{getUserDisplayName(user)}</p>
                          <p className="text-xs text-fg-basic-muted">
                            {[getUserSecondaryName(user), user.userId].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><StatusPill value={user.role} /></td>
                    <td className="px-4 py-3"><StatusPill value={user.status} /></td>
                    <td className="px-4 py-3 text-fg-basic-muted">{formatDateTime(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className={`min-h-9 min-w-20 rounded-full px-4 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-45 ${
                          isBanned ? 'bg-[#49637f]' : 'bg-[#b42345]'
                        }`}
                        disabled={isSelf || actionUserId === user.userId}
                        aria-label={actionUserId === user.userId ? '회원 상태를 변경하는 중입니다.' : undefined}
                        title={isSelf ? '본인 계정은 제재할 수 없어요.' : undefined}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleToggleBan(user);
                        }}
                      >
                        {actionUserId === user.userId
                          ? <LoadingSpinner label="회원 상태를 변경하는 중입니다." size="sm" />
                          : isBanned ? '제재 해제' : '제재'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-fg-basic-muted">
        <span>
          총 {usersData.totalElements}명 · {usersData.page + 1} / {Math.max(usersData.totalPages, 1)} 페이지
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            className="min-h-9 rounded-full border border-[#d7e1ef] bg-white px-4 font-extrabold text-fg-primary disabled:opacity-45"
            disabled={isLoading || usersData.page <= 0}
            onClick={() => loadUsers(usersData.page - 1)}
          >
            이전
          </button>
          <button
            type="button"
            className="min-h-9 rounded-full border border-[#d7e1ef] bg-white px-4 font-extrabold text-fg-primary disabled:opacity-45"
            disabled={isLoading || !usersData.hasNext}
            onClick={() => loadUsers(usersData.page + 1)}
          >
            다음
          </button>
        </div>
      </div>
      </div>
      <AdminUserDetailPanel
        errorMessage={userDetailErrorMessage}
        isLoading={isUserDetailLoading}
        user={selectedUser}
      />
    </section>
  );
}

function AdminCertificationsPanel() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [certifications, setCertifications] = useState([]);
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actionCertificationId, setActionCertificationId] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadCertifications = useCallback(async ({ nextStatus = statusFilter, nextPage = page } = {}) => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const data = await getAdminCertifications({
        status: nextStatus || undefined,
        page: nextPage,
      });
      setCertifications(data);
      setPage(nextPage);
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, '인증 요청 목록을 불러오지 못했어요.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialCertifications() {
      try {
        const data = await getAdminCertifications({ page: 0 });
        if (!isMounted) return;

        setCertifications(data);
        setPage(0);
        setErrorMessage('');
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getAdminErrorMessage(error, '인증 요청 목록을 불러오지 못했어요.'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInitialCertifications();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateCertificationState(updatedCertification) {
    if (!updatedCertification) return;

    setCertifications((currentItems) => currentItems.map((item) => (
      item.certificationId === updatedCertification.certificationId ? updatedCertification : item
    )));
    setSelectedCertification((currentDetail) => (
      currentDetail?.certificationId === updatedCertification.certificationId
        ? updatedCertification
        : currentDetail
    ));
  }

  async function handleSelectCertification(certificationId) {
    try {
      setIsDetailLoading(true);
      setErrorMessage('');
      const detail = await getAdminCertification(certificationId);
      setSelectedCertification(detail);
      setRejectComment(detail?.adminComment ?? '');
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, '인증 요청 상세를 불러오지 못했어요.'));
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleApprove(certificationId) {
    if (!certificationId || actionCertificationId) return;

    try {
      setActionCertificationId(certificationId);
      setErrorMessage('');
      const updatedCertification = await approveCertification(certificationId);
      updateCertificationState(updatedCertification);
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, '인증 요청을 승인하지 못했어요.'));
    } finally {
      setActionCertificationId('');
    }
  }

  async function handleReject(certificationId) {
    const trimmedComment = rejectComment.trim();
    if (!certificationId || actionCertificationId) return;

    if (!trimmedComment) {
      setErrorMessage('거절 사유를 입력해야 해요.');
      return;
    }

    try {
      setActionCertificationId(certificationId);
      setErrorMessage('');
      const updatedCertification = await rejectCertification(certificationId, trimmedComment);
      updateCertificationState(updatedCertification);
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, '인증 요청을 거절하지 못했어요.'));
    } finally {
      setActionCertificationId('');
    }
  }

  const isSelectedRequested = selectedCertification?.status === 'REQUESTED';

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-fg-primary">인증 요청 관리</h2>
            <p className="text-sm text-fg-basic-muted">기숙사 인증 요청을 검토하고 승인하거나 거절해요.</p>
          </div>
          <select
            className="min-h-10 rounded-full border border-[#d7e1ef] bg-white px-4 text-sm font-bold text-fg-primary"
            value={statusFilter}
            onChange={(event) => {
              const nextStatus = event.target.value;
              setStatusFilter(nextStatus);
              loadCertifications({ nextStatus, nextPage: 0 });
            }}
          >
            <option value="">전체</option>
            {certificationStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {errorMessage && <SectionMessage tone="error">{errorMessage}</SectionMessage>}

        <div className="overflow-hidden rounded-lg border border-[#d9e3f0] bg-white">
          {isLoading && (
            <div className="flex justify-center px-4 py-8 text-brand-primary">
              <LoadingSpinner label="인증 요청을 불러오는 중입니다." />
            </div>
          )}

          {!isLoading && certifications.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-fg-basic-muted">
              조회된 인증 요청이 없어요.
            </p>
          )}

          {!isLoading && certifications.map((certification) => (
            <button
              key={certification.certificationId}
              type="button"
              className={`flex w-full items-center justify-between gap-4 border-t border-[#edf1f7] px-4 py-3 text-left first:border-t-0 ${
                selectedCertification?.certificationId === certification.certificationId ? 'bg-[#f5f8fc]' : 'bg-white'
              }`}
              onClick={() => handleSelectCertification(certification.certificationId)}
            >
              <div className="min-w-0">
                <p className="font-extrabold text-fg-basic">{certification.semester}</p>
                <p className="truncate text-xs text-fg-basic-muted">
                  {[getCertificationUserName(certification), formatDateTime(certification.createdAt)]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <StatusPill value={certification.status} />
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="min-h-9 rounded-full border border-[#d7e1ef] bg-white px-4 text-sm font-extrabold text-fg-primary disabled:opacity-45"
            disabled={isLoading || page <= 0}
            onClick={() => loadCertifications({ nextPage: page - 1 })}
          >
            이전
          </button>
          <button
            type="button"
            className="min-h-9 rounded-full border border-[#d7e1ef] bg-white px-4 text-sm font-extrabold text-fg-primary disabled:opacity-45"
            disabled={isLoading || certifications.length < 15}
            onClick={() => loadCertifications({ nextPage: page + 1 })}
          >
            다음
          </button>
        </div>
      </div>

      <aside className="rounded-lg border border-[#d9e3f0] bg-white p-4">
        {!selectedCertification && !isDetailLoading && (
          <p className="py-16 text-center text-sm text-fg-basic-muted">
            인증 요청을 선택하면 상세 정보가 보여요.
          </p>
        )}

        {isDetailLoading && (
          <div className="flex justify-center py-16 text-brand-primary">
            <LoadingSpinner label="인증 요청 상세 정보를 불러오는 중입니다." />
          </div>
        )}

        {selectedCertification && !isDetailLoading && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-fg-primary">인증 상세</h3>
                <p className="text-xs text-fg-basic-muted">{selectedCertification.certificationId}</p>
              </div>
              <StatusPill value={selectedCertification.status} />
            </div>

            {selectedCertification.imageURL ? (
              <a
                className="block overflow-hidden rounded-lg border border-[#d9e3f0] bg-[#f5f8fc]"
                href={selectedCertification.imageURL}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  className="max-h-[360px] w-full object-contain"
                  src={selectedCertification.imageURL}
                  alt="인증 이미지"
                />
              </a>
            ) : (
              <div className="flex min-h-40 items-center justify-center rounded-lg bg-[#f5f8fc] text-sm text-fg-basic-muted">
                이미지가 없어요.
              </div>
            )}

            <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-2 text-sm">
              <DetailRow label="회원" value={getCertificationUserName(selectedCertification)} />
              <DetailRow label="회원 ID" value={selectedCertification.userId} />
              <DetailRow label="학기" value={selectedCertification.semester} />
              <DetailRow label="요청일" value={formatDateTime(selectedCertification.createdAt)} />
              <DetailRow label="코멘트" value={selectedCertification.adminComment} />
            </dl>

            {isSelectedRequested && (
              <div className="flex flex-col gap-2">
                <textarea
                  className="min-h-24 resize-none rounded-lg border border-[#d7e1ef] bg-[#f8fbff] px-3 py-2 text-sm text-fg-basic outline-none focus:border-brand-primary"
                  placeholder="거절 사유를 입력하세요."
                  value={rejectComment}
                  onChange={(event) => setRejectComment(event.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="min-h-10 rounded-full bg-brand-primary px-4 text-sm font-extrabold text-white disabled:opacity-60"
                    disabled={actionCertificationId === selectedCertification.certificationId}
                    onClick={() => handleApprove(selectedCertification.certificationId)}
                  >
                    승인
                  </button>
                  <button
                    type="button"
                    className="min-h-10 rounded-full bg-[#b42345] px-4 text-sm font-extrabold text-white disabled:opacity-60"
                    disabled={actionCertificationId === selectedCertification.certificationId}
                    onClick={() => handleReject(selectedCertification.certificationId)}
                  >
                    거절
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </section>
  );
}

function AdminMatchPanel() {
  const [form, setForm] = useState({
    matchStartDate: '',
    matchEndDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const config = await getMatchingConfig();
        if (isMounted) {
          setForm({
            matchStartDate: config.matchStartDate ?? '',
            matchEndDate: config.matchEndDate ?? '',
          });
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(getAdminErrorMessage(error, '매칭 날짜를 불러오지 못했어요.'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.matchStartDate || !form.matchEndDate) {
      setErrorMessage('시작일과 종료일을 모두 입력해야 해요.');
      return;
    }

    if (form.matchStartDate > form.matchEndDate) {
      setErrorMessage('시작일은 종료일보다 늦을 수 없어요.');
      return;
    }

    try {
      setIsSaving(true);
      setMessage('');
      setErrorMessage('');
      await updateMatchingConfig(form);
      setMessage('매칭 날짜를 저장했어요.');
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, '매칭 날짜를 저장하지 못했어요.'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-[560px] flex-col gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-fg-primary">매칭 날짜 설정</h2>
        <p className="text-sm text-fg-basic-muted">오늘의 룸메 매칭이 열리는 기간을 설정해요.</p>
      </div>

      {errorMessage && <SectionMessage tone="error">{errorMessage}</SectionMessage>}
      {message && <SectionMessage>{message}</SectionMessage>}

      <form className="rounded-lg border border-[#d9e3f0] bg-white p-5" onSubmit={handleSubmit}>
        {isLoading ? (
          <div className="flex justify-center py-12 text-brand-primary">
            <LoadingSpinner label="매칭 설정을 불러오는 중입니다." />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-extrabold text-fg-primary">
              시작일
              <input
                type="date"
                className="min-h-11 rounded-lg border border-[#d7e1ef] bg-[#f8fbff] px-3 text-sm text-fg-basic outline-none focus:border-brand-primary"
                value={form.matchStartDate}
                onChange={(event) => setForm((currentForm) => ({
                  ...currentForm,
                  matchStartDate: event.target.value,
                }))}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-extrabold text-fg-primary">
              종료일
              <input
                type="date"
                className="min-h-11 rounded-lg border border-[#d7e1ef] bg-[#f8fbff] px-3 text-sm text-fg-basic outline-none focus:border-brand-primary"
                value={form.matchEndDate}
                onChange={(event) => setForm((currentForm) => ({
                  ...currentForm,
                  matchEndDate: event.target.value,
                }))}
              />
            </label>

            <button
              type="submit"
              className="mt-2 min-h-11 rounded-full bg-brand-primary px-5 text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60"
              disabled={isSaving}
              aria-label={isSaving ? '매칭 날짜를 저장하는 중입니다.' : undefined}
            >
              {isSaving
                ? <LoadingSpinner label="매칭 날짜를 저장하는 중입니다." size="sm" />
                : '저장'}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function AdminMonitoringPanel() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadSummary = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) setIsLoading(true);
      setErrorMessage('');
      const data = await getAdminMonitoringSummary();
      setSummary(data);
    } catch (error) {
      setErrorMessage(getAdminErrorMessage(error, '모니터링 요약을 불러오지 못했어요.'));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSummary();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadSummary]);

  const matching = summary?.matching ?? {};
  const chat = summary?.chat ?? {};
  const matchingMetrics = [
    { label: '하트 보낸 수', value: matching.heartSent },
    { label: '서로 하트 매칭 수', value: matching.heartMatched, tone: 'accent' },
    { label: '최종확정 대기 수', value: matching.confirmPending },
    { label: '최종확정 완료 수', value: matching.finalConfirmed, tone: 'accent' },
    { label: '종료된 매칭 수', value: matching.closed },
  ];
  const chatMetrics = [
    { label: '전체 채팅방 수', value: chat.totalRooms },
    { label: '열린 채팅방 수', value: chat.openRooms, tone: 'accent' },
    { label: '닫힌 채팅방 수', value: chat.closedRooms },
    { label: '전체 메시지 수', value: chat.totalMessages },
    { label: '오늘 메시지 수', value: chat.messagesToday, tone: 'accent' },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-fg-primary">모니터링</h2>
          <p className="text-sm text-fg-basic-muted">매칭과 채팅 운영 현황을 확인해요.</p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-10 items-center rounded-full border border-[#d7e1ef] bg-white px-4 text-sm font-extrabold text-fg-primary disabled:cursor-wait disabled:opacity-60"
          disabled={isLoading}
          onClick={() => loadSummary()}
        >
          {isLoading ? '새로고침 중' : '새로고침'}
        </button>
      </div>

      {errorMessage && <SectionMessage tone="error">{errorMessage}</SectionMessage>}

      {isLoading ? (
        <div className="flex justify-center rounded-lg border border-[#d9e3f0] bg-white py-16 text-brand-primary">
          <LoadingSpinner label="모니터링 요약을 불러오는 중입니다." />
        </div>
      ) : (
        <>
          <MonitoringVisualSummary chat={chat} matching={matching} />
          <MetricGroup metrics={matchingMetrics} title="매칭 현황" />
          <MetricGroup metrics={chatMetrics} title="채팅 현황" />
          <p className="text-right text-xs font-semibold text-fg-basic-muted">
            마지막 갱신 시각: {formatDateTime(summary?.updatedAt)}
          </p>
        </>
      )}
    </section>
  );
}

function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    let isMounted = true;

    async function checkAdminRole() {
      try {
        const user = await getCurrentUser();
        if (!isMounted) return;

        setCurrentUser(user);
        setAuthStatus(user?.role === 'ADMIN' ? 'allowed' : 'denied');
      } catch (error) {
        if (!isMounted) return;
        setAuthStatus(error?.response?.status === 403 ? 'denied' : 'error');
      }
    }

    checkAdminRole();
    return () => {
      isMounted = false;
    };
  }, []);

  const activePanel = useMemo(() => {
    if (activeTab === 'certifications') return <AdminCertificationsPanel />;
    if (activeTab === 'match') return <AdminMatchPanel />;
    if (activeTab === 'monitoring') return <AdminMonitoringPanel />;
    return <AdminUsersPanel currentUser={currentUser} />;
  }, [activeTab, currentUser]);

  if (authStatus === 'checking') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-brand-background px-5 text-sm font-semibold text-fg-basic-muted">
        관리자 권한을 확인하고 있어요.
      </main>
    );
  }

  if (authStatus !== 'allowed') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-brand-background px-5">
        <div className="w-full max-w-[420px] rounded-lg border border-[#d9e3f0] bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-extrabold text-fg-primary">접근 권한이 없어요</h1>
          <p className="mt-2 text-sm leading-6 text-fg-basic-muted">
            관리자 계정으로 다시 로그인한 뒤 접근해 주세요.
          </p>
          <Link
            className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-extrabold text-white no-underline"
            to="/"
          >
            홈으로 이동
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-brand-background px-5 py-6">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-fg-basic-muted">Yulgok Admin</p>
            <h1 className="mt-1 text-2xl font-extrabold text-fg-primary">관리자 페이지</h1>
          </div>
          <Link
            className="inline-flex min-h-10 items-center rounded-full border border-[#d7e1ef] bg-white px-4 text-sm font-extrabold text-fg-primary no-underline"
            to="/matching"
          >
            서비스로 이동
          </Link>
        </header>

        <nav className="grid grid-cols-2 gap-2 rounded-lg border border-[#d9e3f0] bg-white p-1 sm:grid-cols-4" aria-label="관리자 메뉴">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`min-h-11 rounded-md text-sm font-extrabold transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'text-fg-basic-muted hover:bg-[#f5f8fc]'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {activePanel}
      </div>
    </main>
  );
}

export default Admin;
