import * as React from 'react';

const PolicyContext = React.createContext<any>(null);

interface Props<Context> {
  context: Context;
}

export class Provider<C = any> extends React.Component<Props<C>> {
  render() {
    return React.createElement(PolicyContext.Provider, { value: this.props.context }, this.props.children);
  }
}

export function usePolicy<P>(policyClass: { new (context: any): P }): P {
  const policyContext = React.useContext(PolicyContext);
  return new policyClass(policyContext);
}

export function withPolicies<PolicyProps extends { [name: string]: { new (context: any): any } }>(
  policyClasses: PolicyProps,
) {
  return <T>(WrappedComponent: React.ComponentType<T>) => {
    const componentWithPolicy: React.FC<Omit<T, keyof PolicyProps>> = props => {
      const policyContext = React.useContext(PolicyContext);
      const policies = Object.keys(policyClasses).reduce((acc: Partial<PolicyProps>, name) => {
        const policyClass = policyClasses[name as keyof PolicyProps];
        acc[name as keyof PolicyProps] = new policyClass(policyContext);
        return acc;
      }, {});
      return React.createElement(WrappedComponent, {
        ...(props as T),
        ...policies,
      });
    };

    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    componentWithPolicy.displayName = `withPolicies(${displayName})`;

    return componentWithPolicy;
  };
}

export function authorize<P>(
  policyClass: { new (context: any): P },
  check: ({ props, policy }: { props: any; policy: P }) => boolean,
  fallback?: React.ReactElement,
) {
  return <T>(WrappedComponent: React.ComponentType<T>) => {
    const componentWithPolicy: React.FC<T> = props => {
      const policyContext = React.useContext(PolicyContext);
      const policy = new policyClass(policyContext);
      if (check({ policy, props })) {
        return React.createElement(WrappedComponent, props);
      }
      return fallback ?? null;
    };

    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    componentWithPolicy.displayName = `authorize(${displayName})`;

    return componentWithPolicy;
  };
}

export function Authorize<P>(props: React.PropsWithChildren<{
  with: { new (context: any): P };
  if: (policy: P) => boolean;
  fallback?: React.ReactElement;
}>): React.ReactElement {
  const { with: policyClass, if: check, children, fallback } = props;
  const policyContext = React.useContext(PolicyContext);
  const policy = new policyClass(policyContext);
  if (check(policy)) {
    return React.createElement(React.Fragment, null, children);
  }
  return React.createElement(React.Fragment, null, fallback);
}
