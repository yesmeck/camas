<div align="center">
  <img src="https://user-images.githubusercontent.com/465125/67983909-9c3fd600-fc60-11e9-914c-bc03547412ed.png" alt="camas logo" />
</div>

<hr />

Camas is a React authorization library.

- **TypeScript friendly**
- **Zero dependencies**
- **React Hooks**
- **Only 559 Bytes after gzip**

## Installation

Use npm:

```bash
$ npm install camas --save
```

Use yarn:

```bash
$ yarn add camas
```

## Usage

### Define a policy

```typescript
import { Policy } from 'camas';

interface Context {
  role: 'admin' | 'guest';
}

class PostPolicy extends Policy<Context> {
  create() {
    return this.context.role === 'admin';
  }
}
```

### Add provider

```typescript
import { Provider } from 'camas';

const App = () => (
  <Provider value={{ role: currentUser.role }}>
    <Routes />
  </Provider>
);
```

### Consume policy

```typescript
import { usePolicy } from 'camas';

const PostList = ({ posts }) => {
  const policy = usePolicy();

  return (
    <div>
      {policy(PostPolicy).create() && <a href="/posts/new">New</a>}
      <ul>
        {posts.map(post => (
          <li>{post.title}</li>
        ))}
      </ul>
    </div>
  );
};
```

## License

MIT
