import HomeLayout, { StatCard } from '../components/HomeLayout';
import { getOwnerDashboard } from '../api/auth.api';

export default function OwnerHomeScreen() {
  return (
    <HomeLayout
      loadDashboard={getOwnerDashboard}
      renderStats={(d) => (
        <>
          <StatCard label="Tổng số phòng" value={d.rooms.total} />
          <StatCard label="Phòng còn trống" value={d.rooms.AVAILABLE} highlight />
          <StatCard label="Đang cho thuê" value={d.rooms.RENTED} />
          <StatCard label="Yêu cầu chờ xử lý" value={d.pendingRequests} />
          <StatCard label="Nhà trọ" value={d.properties} />
          <StatCard label="Hợp đồng hiệu lực" value={d.activeContracts} />
        </>
      )}
      note="Đăng phòng, xử lý yêu cầu thuê và lập hóa đơn sẽ có ở các phiên bản tiếp theo."
    />
  );
}
