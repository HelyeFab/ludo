import { getAlbums } from "@/lib/albums";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { verifySessionDAL } from "@/lib/dal";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Verify authentication at data access layer
  const session = await verifySessionDAL();

  if (!session.isAuthenticated) {
    redirect("/login?from=/admin");
  }

  const albums = await getAlbums();

  return <AdminDashboard initialAlbums={albums} />;
}
