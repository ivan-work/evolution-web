class RootService {
  root = null;

  rootResolve = null;

  rootPromise = null;

  constructor() {
    this.rootPromise = new Promise((resolve) => {
      this.rootResolve = resolve
    })
  }

  setRoot(root) {
    this.root = root;
    this.rootResolve(root);
  }
}

export default new RootService();