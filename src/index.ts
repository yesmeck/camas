import * as React from 'react';

const PolicyContext = React.createContext<any>(null);

export class Policy<Context = any> {
  protected context: Context;

  constructor(context: Context) {
    this.context = context;
  }
}

interface Props<Context> {
  context: Context;
}

export class Provider<C = any> extends React.Component<Props<C>> {
  render() {
    return React.createElement(PolicyContext.Provider, { value: this.props.context }, this.props.children);
  }
}

export function usePolicy() {
  const policyContext = React.useContext(PolicyContext);

  return function<P extends Policy>(policy: { new (context: any): P }): P {
    return new policy(policyContext);
  };
}
