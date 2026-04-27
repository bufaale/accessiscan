// Pass-through layout — login/signup use the v2 AuthShell which renders a
// full-page split-panel layout. forgot-password supplies its own centered
// container in its page.tsx (the v2 redesign for forgot-password is pending).
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
