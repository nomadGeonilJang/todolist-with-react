import _ from "lodash";
import storage from "../../utils/storage";
import {
  CREATE,
  DELTE,
  TOGGLE,
  UPDATE,
  TOGGLE_UPDATE,
  LOAD,
} from "./../actions/todo";

export const createTodo = (text: string) => ({
  type: CREATE,
  payload: text,
});
export const deleteTodo = (id: number) => ({
  type: DELTE,
  payload: id,
});
export const updateTodo = (updatedTodo: { text: string; id: number }) => ({
  type: UPDATE,
  payload: updatedTodo,
});
export const toggleTodo = (id: number) => ({
  type: TOGGLE,
  payload: id,
});
export const toggleUpdate = (stage: Todo | null) => ({
  type: TOGGLE_UPDATE,
  payload: stage,
});
export const loadTodos = () => ({
  type: LOAD,
});

export type TodoAction =
  | ReturnType<typeof createTodo>
  | ReturnType<typeof deleteTodo>
  | ReturnType<typeof toggleTodo>
  | ReturnType<typeof toggleUpdate>
  | ReturnType<typeof loadTodos>
  | ReturnType<typeof updateTodo>;

export type Todo = {
  id: number;
  text: string;
  done: boolean;
  at: Date;
};
export interface InitialTodoState {
  nextId: number;
  stage: Todo | null;
  todos: Todo[];
}

const initialTodoState: InitialTodoState = {
  nextId: 1,
  stage: null,
  todos: [],
};

const reducer = (
  state: InitialTodoState = initialTodoState,
  action: TodoAction
): InitialTodoState => {
  switch (action.type) {
    case LOAD: {
      const loadedState = storage.get("todos");
      if (!loadedState) {
        return state;
      } else {
        return JSON.parse(loadedState);
      }
    }
    case DELTE:
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    case TOGGLE: {
      const todos = _.cloneDeep(state.todos);
      const newState = {
        ...state,
        todos: todos.map((todo) => {
          if (todo.id === action.payload) {
            todo.done = !todo.done;
          }
          return todo;
        }),
      };
      storage.set("todos", JSON.stringify(newState));
      return newState;
    }
    case CREATE: {
      const nextId = state.nextId + 1;
      const newState = {
        ...state,
        nextId,
        todos: [
          ...state.todos,
          { id: nextId, text: action.payload, done: false, at: new Date() },
        ],
      };
      storage.set("todos", JSON.stringify(newState));
      return newState;
    }
    case TOGGLE_UPDATE:
      return {
        ...state,
        stage: action.payload,
      };
    case UPDATE: {
      const findIndex = state.todos.findIndex(
        (todo) => todo.id === action.payload.id
      );
      const newTodos = [...state.todos];
      const todo = _.cloneDeep(newTodos[findIndex]);
      todo.text = action.payload.text;
      newTodos.splice(findIndex, 1, todo);
      const newState = { ...state, stage: null, todos: newTodos };
      storage.set("todos", JSON.stringify(newState));
      return newState;
    }
    default:
      return state;
  }
};

export default reducer;
