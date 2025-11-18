import { getAlbums } from "@/lib/albums";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const albums = await getAlbums();

  return <AdminDashboard initialAlbums={albums} />;
}
