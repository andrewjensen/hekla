declare module 'tree-walk' {
  type WalkStrategy = Function;

  export type FilterFunction = (value: any, key: any, parent: any) => boolean;
  type VisitorFunction = (node: any) => void;

  interface Walker {
    preorder: (tree: any, visitorFn: VisitorFunction) => void
  }

  function walk(visitor: VisitorFunction): Walker;

  namespace walk {
    function preorder(tree: any, visitorFn: VisitorFunction): void;
    function filter(tree: any, strategy: WalkStrategy, filterFn: FilterFunction): any[];
  }

  export default walk;
}
