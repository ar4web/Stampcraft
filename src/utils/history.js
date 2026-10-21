// Linear undo/redo stack (max 50 states) of serialized canvas snapshots.

const LIMIT = 50;

export function createHistory() {
  let past = [];
  let future = [];
  let present = null;
  let locked = false;

  return {
    get locked() {
      return locked;
    },
    lock() {
      locked = true;
    },
    unlock() {
      locked = false;
    },
    reset(state) {
      past = [];
      future = [];
      present = state ? JSON.stringify(state) : null;
    },
    push(state) {
      if (locked) return false;
      const str = JSON.stringify(state);
      if (str === present) return false;
      if (present !== null) past.push(present);
      if (past.length > LIMIT) past.shift();
      present = str;
      future = [];
      return true;
    },
    undo() {
      if (!past.length) return null;
      future.unshift(present);
      if (future.length > LIMIT) future.pop();
      present = past.pop();
      return JSON.parse(present);
    },
    redo() {
      if (!future.length) return null;
      past.push(present);
      present = future.shift();
      return JSON.parse(present);
    },
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    size: () => ({ past: past.length, future: future.length }),
  };
}
