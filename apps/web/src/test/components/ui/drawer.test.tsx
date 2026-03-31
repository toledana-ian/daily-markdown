import { render, screen } from '@testing-library/react';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';

describe('DrawerContent', () => {
  test('uses the full viewport height for bottom drawers', () => {
    render(
      <Drawer onOpenChange={() => undefined} open>
        <DrawerContent>
          <DrawerTitle>Drawer title</DrawerTitle>
          <DrawerDescription>Drawer description</DrawerDescription>
          <div>Drawer body</div>
        </DrawerContent>
      </Drawer>
    );

    const content = screen.getByRole('dialog');

    expect(content).toHaveClass('data-[vaul-drawer-direction=bottom]:top-0');
    expect(content).toHaveClass('data-[vaul-drawer-direction=bottom]:h-dvh');
    expect(content).not.toHaveClass('data-[vaul-drawer-direction=bottom]:max-h-[80vh]');
  });
});
