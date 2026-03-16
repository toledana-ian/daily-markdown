import type { ComponentProps } from 'react';

export const DashboardPage = (props: ComponentProps<'section'>) => (
  <section {...props}>
    <h1>Dashboard</h1>
    <p>Welcome to your dashboard.</p>
  </section>
);

export default DashboardPage;
