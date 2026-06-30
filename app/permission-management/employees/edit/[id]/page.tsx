import EditStaff from "@/components/layouts/permission-management/Edit-Staff";

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditStaff userId={id} />;
}
