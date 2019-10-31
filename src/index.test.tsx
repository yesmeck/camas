import * as React from 'react';
import { Policy, Provider, usePolicy } from './index';
import TestRenderer, { act } from 'react-test-renderer';

class PostPolicy extends Policy {
  create() {
    return this.context.role === 'admin';
  }
}

const Post: React.FC = () => {
  const policy = usePolicy();

  return <div>{policy(PostPolicy).create() ? 'allow' : 'deny'}</div>;
};

describe('camas', () => {
  it('Policy', () => {
    expect(new PostPolicy({ role: 'admin' }).create()).toBe(true);
    expect(new PostPolicy({ role: 'guest' }).create()).toBe(false);
  });

  it('usePolicy', () => {
    const App = React.forwardRef((_, ref) => {
      const [role, setRole] = React.useState('admin');

      React.useImperativeHandle(ref, () => ({
        setRole,
      }));

      return (
        <Provider context={{ role }}>
          <Post />
        </Provider>
      );
    });
    const app = React.createRef<any>();
    const instance = TestRenderer.create(<App ref={app} />);

    expect(instance.root.findByType('div').children).toEqual(['allow']);

    act(() => {
      app.current!.setRole('guest');
    });

    expect(instance.root.findByType('div').children).toEqual(['deny']);
  });
});
