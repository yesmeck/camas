<div align="center">
  <img src="https://user-images.githubusercontent.com/465125/67983909-9c3fd600-fc60-11e9-914c-bc03547412ed.png" alt="camas logo" />
</div>

<hr />

![Codecov](https://img.shields.io/codecov/c/github/yesmeck/camas?style=for-the-badge)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/camas?style=for-the-badge)
![npm](https://img.shields.io/npm/v/camas?style=for-the-badge)

Camas is a OO design minimal React authorization library.

[Live demo](https://codesandbox.io/s/camas-demo-17pjy)

- **TypeScript friendly**
- **Zero dependencies**
- **React Hooks**
- **Scalable**
- **Easy to test**
- **Only 500 Bytes after gzip**

## Installation

Use npm:

```bash
$ npm install camas --save
```

Use yarn:

```bash
$ yarn add camas
```

## Policies

Camas is focused around the notion of policy classes. I suggest that you put these classes in `src/policies`. This is a simple example that allows updating a post if the user is an admin, or if the post is unpublished:

```typescript
interface Post {
  title: string;
  body: string;
  isPublished: boolean;
}

interface User {
  username: string;
  isAdmin: boolean;
}

class PostPolicy {
  protected user: User;

  construtor(context: { user: User }) {
    this.user = context.user;
  }

  update(post: Post) {
    return this.user.isAdmin || !post.isPublished;
  }
}
```

As you can see, this is just a plain JavaScript class.

Usually you can set up a base class to inherit from:

```typescript
class BasePolicy {
  protected user: User;

  construtor(context: { user: User }) {
    this.user = context.user;
  }
}

class PostPolicy extends BasePolicy {
  update(post: Post) {
    return this.user.isAdmin || !post.isPublished;
  }
}
```

## Context provider

```typescript
import { Provider } from 'camas';

const App = () => (
  <Provider context={{ user: currentUser }}>
    <Routes />
  </Provider>
);
```

Camas will pass `context` to the policy class when initializing it.

## Consume policy

### Using hook

```typescript
import { usePolicy } from 'camas';

const PostList = ({ posts }) => {
  const [postPolicy] = usePolicy(PostPolicy);

  return (
    <div>
      <ul>
        {posts.map(post => (
          <li>
            {post.title}
            {postPolicy.update(post) && <span>Edit</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### Using component

```typescript
import { Authorize } from 'camas';

const PostList = ({ posts }) => {
  return (
    <div>
      <ul>
        {posts.map(post => (
          <li>
            {post.title}
            <Authorize with={PostPolicy} if={policy => policy.update(post)}>
              <span>Edit</span>
            </Authorize>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## Testing

Since polices are just plain classes, testing your polices can be very easy.

Here is a simple example with jest:

```javascript
import PostPolicy from './PostPolicy';

descript('PostPolicy', () => {
  const admin = {
    isAdmin: true;
  };

  const normalUser = {
    isAdmin: false;
  }

  const publishedPost = {
    isPublished: true;
  }

  const unpublishedPost = {
    isPublished: false;
  }

  it("denies access if post is published", () => {
    expect(new PostPolicy({ user: normalUser }).update(publishedPost)).toBe(false);
  });

  it("grants access if post is unpublished", () => {
    expect(new PostPolicy({ user: normalUser }).update(unpublishedPost)).toBe(true);
  });

  it("grants access if post is published and user is an admin", () => {
    expect(new PostPolicy({ user: admin }).update(publishedPost)).toBe(true);
  });
});
```

## API

### `Provider`

#### Props

- `context` - Camas passes `conetxt` to the policy class when initializing it.

```javascript
<Providery conetxt={{ user: currentUser }}>
  <App />
</Providery>
```

### `Authorize`

#### Props

- `with` - Policy class.
- `if` - Check function for the policy, it accepts the policy instance as it's first argument.
- `fallback` - Fallback element when policy check now pass.

```javascript
<Authorize
  with={PostPolicy}
  if={policy => policy.show()}
  fallback={<div>You are not allow to view these posts.</div>}
>
  <PostList />
</Authorize>
```

### `usePolicy(...policies)`

The `usePolicy` hook receive policies class as it's arguments and return instances of them.

```javascript
const [postPolicy, commentPolicy] = usePolicy(PostPolicy, CommentPolicy);
```

## License

MIT
