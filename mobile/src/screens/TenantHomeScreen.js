import HomeLayout, { StatCard } from '../components/HomeLayout';
import { getTenantDashboard } from '../api/auth.api';

export default function TenantHomeScreen() {
  return (
    <HomeLayout
      loadDashboard={getTenantDashboard}
      renderStats={(d) => (
        <>
          <StatCard label="Yêu cầu đang chờ" value={d.rentalRequests.PENDING} highlight />
          <StatCard label="Yêu cầu được duyệt" value={d.rentalRequests.APPROVED} />
          <StatCard label="Hợp đồng hiệu lực" value={d.activeContracts} />
          <StatCard label="Hóa đơn chưa trả" value={d.unpaidInvoices} />
        </>
      )}
      note="Tìm phòng, gửi yêu cầu thuê và xem hóa đơn sẽ có ở các phiên bản tiếp theo."
    />
  );
}
