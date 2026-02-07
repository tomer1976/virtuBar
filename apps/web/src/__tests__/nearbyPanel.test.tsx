import { fireEvent, render, screen, within } from '@testing-library/react';
import NearbyPanel from '../ui/components/NearbyPanel';
import { generateNearbyUsers, sortNearby } from '../state/mockNearby';
import { RoomMemberState } from '../net/realtime/types';

describe('NearbyPanel', () => {
  it('groups by region and keeps rank order from sortNearby', () => {
    const seed = 'nearby-seed';
    const expected = sortNearby(generateNearbyUsers({ seed }));

    render(<NearbyPanel seed={seed} />);
    const list = screen.getByLabelText(/Nearby list/i);
    const items = within(list).getAllByTestId(/nearby-/);

    expected.forEach((user, idx) => {
      expect(within(items[idx]).getByText(user.displayName)).toBeInTheDocument();
      expect(within(items[idx]).getByLabelText(new RegExp(`Region ${user.region}`))).toBeInTheDocument();
      expect(within(items[idx]).getByText(`#${idx + 1}`)).toBeInTheDocument();
    });
  });

  it('renders realtime members without mock drift and tags self user', () => {
    const realtimeMembers: RoomMemberState[] = [
      {
        userId: 'alice',
        displayName: 'Alice',
        avatarId: 'a',
        x: 0,
        y: 0.3,
        z: 0,
        rotY: 0,
        anim: 'idle',
        speaking: false,
      },
      {
        userId: 'bob',
        displayName: 'Bob',
        avatarId: 'b',
        x: 1,
        y: 0.3,
        z: 1,
        rotY: 0,
        anim: 'walk',
        speaking: true,
      },
    ];

    render(<NearbyPanel realtimeMembers={realtimeMembers} selfUserId="bob" />);

    const list = screen.getByLabelText(/Nearby list/i);
    const items = within(list).getAllByTestId(/nearby-/);
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('Alice')).toBeInTheDocument();
    expect(within(items[1]).getByText('Bob')).toBeInTheDocument();
    expect(within(items[1]).getByText(/You/)).toBeInTheDocument();
  });

  it('opens and closes profile overlay for a nearby user', () => {
    render(<NearbyPanel seed="nearby-profile" count={4} />);

    fireEvent.click(screen.getByTestId('nearby-1'));
    expect(screen.getByRole('dialog', { name: /Profile/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(screen.queryByRole('dialog', { name: /Profile/i })).not.toBeInTheDocument();
  });
});
