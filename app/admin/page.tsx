import { AdminDashboard } from "@/components/AdminDashboard";

export default function AdminPage() {
  return (
    <main className="section">
      <div className="container">
        <p className="tag">Private Admin</p>
        <h1>Marketplace Manager</h1>
        <p className="lead">
          Create, edit, publish, archive, and remove Twin Unity TCG listings.
          Admin access is limited to configured Supabase users.
        </p>
        <AdminDashboard />
      </div>
    </main>
  );
}
