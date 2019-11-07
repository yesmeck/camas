import * as React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Provider, usePolicy, withPolicies, authorize, Authorize } from './index';

enum Role {
  admin = 'admin',
  guest = 'guest',
}

class PostPolicy {
  protected role: Role;

  constructor({ role }: { role: Role }) {
    this.role = role;
  }

  create() {
    return this.role === Role.admin;
  }
}

describe('camas', () => {
  it('Policy', () => {
    expect(new PostPolicy({ role: Role.admin }).create()).toBe(true);
    expect(new PostPolicy({ role: Role.guest }).create()).toBe(false);
  });

  it('usePolicy', () => {
    const Post: React.FC = () => {
      const postPolicy = usePolicy(PostPolicy);

      return <div>{postPolicy.create() ? 'allow' : 'deny'}</div>;
    };

    const App = React.forwardRef((_, ref) => {
      const [role, setRole] = React.useState<Role>(Role.admin);

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

    expect(instance.toJSON()).toMatchSnapshot();

    act(() => {
      app.current!.setRole(Role.guest);
    });

    expect(instance.toJSON()).toMatchSnapshot();
  });

  it('withPolices', () => {
    const Post: React.FC<{ postPolicy: PostPolicy }> = ({ postPolicy }) => {
      return <div>{postPolicy.create() ? 'allow' : 'deny'}</div>;
    };
    const PostWithPolicies = withPolicies({ postPolicy: PostPolicy })(Post);

    const App = () => (
      <Provider context={{ role: Role.admin }}>
        <PostWithPolicies />
      </Provider>
    );
    const instance = TestRenderer.create(<App />);
    expect(instance.toJSON()).toMatchSnapshot();
  });

  describe('authorize', () => {
    const Post: React.FC = () => {
      return <div>hello</div>;
    };

    const PostWithAuthorize = authorize(PostPolicy, ({ policy }) => policy.create())(Post);

    it('success', () => {
      const App = () => (
        <Provider context={{ role: Role.admin }}>
          <PostWithAuthorize />
        </Provider>
      );
      const instance = TestRenderer.create(<App />);
      expect(instance.toJSON()).toMatchSnapshot();
    });

    it('fails', () => {
      const App = () => (
        <Provider context={{ role: Role.guest }}>
          <PostWithAuthorize />
        </Provider>
      );
      const instance = TestRenderer.create(<App />);
      expect(instance.toJSON()).toMatchSnapshot();
    });

    it('fails with fallback', () => {
      const PostWithAuthorize = authorize(PostPolicy, ({ policy }) => policy.create(), <div>unauthorized</div>)(Post);

      const App = () => (
        <Provider context={{ role: Role.guest }}>
          <PostWithAuthorize />
        </Provider>
      );
      const instance = TestRenderer.create(<App />);
      expect(instance.toJSON()).toMatchSnapshot();
    });
  });

  it('Authorize', () => {
    const Post: React.FC = () => {
      return (
        <div>
          <Authorize with={PostPolicy} if={policy => policy.create()} fallback={<div>unauthorized</div>}>
            hello
          </Authorize>
        </div>
      );
    };

    const App = React.forwardRef((_, ref) => {
      const [role, setRole] = React.useState<Role>(Role.admin);

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

    expect(instance.toJSON()).toMatchSnapshot();

    act(() => {
      app.current!.setRole(Role.guest);
    });

    expect(instance.toJSON()).toMatchSnapshot();
  });
});
