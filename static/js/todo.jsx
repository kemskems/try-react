// Action types

var ADD_TODO = 'ADD_TODO';
var TOGGLE_TODO = 'TOGGLE_TODO';
var CLEAR_TODOS = 'CLEAR_TODOS';

// Action creators
// action schema adhering to https://github.com/acdlite/flux-standard-action

var todoActionCreators = {
  addTodo: function (text) {
    return {
      type: ADD_TODO,
      payload: {
        text: text
      }
    };
  },
  toggleTodo: function (id) {
    return {
      type: TOGGLE_TODO,
      payload: {
        id: id
      }
    };
  },
  clearTodos: function () {
    return { type: CLEAR_TODOS };
  }
};

// Reducers

var initialState = {
  todos: [
    {text: 'Makan siang', done: false},
    {text: 'Beli baju', done: true}
  ]
};

var todoReducer = function (todos, action) {
  if (typeof todos === 'undefined') {
    return initialState.todos;
  }

  switch (action.type) {
    case ADD_TODO:
      return todos.concat([{
        text: action.payload.text, done: false
      }]);
      break;

    case TOGGLE_TODO:
      return todos.map(function (todo, index) {
        if (index === action.payload.id) {
          todo.done = !todo.done;
        }
        return todo;
      });
      break;

    case CLEAR_TODOS:
      return todos.filter(function (todo) {
        return !todo.done;
      });
      break;

    default:
      return todos;
  }
};

// Store
// Our todo app's state is just on object with a list of todos under `todos` key
// A todo is an object with key `text` and `done`

var reducer = Redux.combineReducers({
  todos: todoReducer
});
var store = Redux.createStore(reducer);

// View: Presentational components

var TodoItem = React.createClass({
  render: function () {
    var style = {};
    if (this.props.done) {
      style.textDecoration = 'line-through';
    }

    return (
      <li style={style}>
        <input
            type="checkbox"
            checked={this.props.done}
            onChange={this._onChange}
        />
        {this.props.text}
      </li>
    );
  },

  _onChange: function () {
    this.props.toggleTodo(this.props.id);
  }
});

var TodoForm = React.createClass({
  getInitialState: function () {
    return {text: ''};
  },

  render: function () {
    return (
      <form onSubmit={this._onSubmit}>
        <input type="text"
               value={this.state.text}
               onChange={this._onChange}
        />
        <input type="submit" value="Add" />
        <button onClick={this._onClick}>Clear</button>
      </form>
    );
  },

  _onChange: function (e) {
    this.setState({text: e.target.value});
  },

  _onSubmit: function (e) {
    e.preventDefault();
    var todoText = this.state.text.trim();

    if (!todoText) {
      return;
    }

    this.props.addTodo(todoText);

    this.setState({text: ''});
  },

  _onClick: function () {
    this.props.clearTodos();
  }
});

var TodoList = React.createClass({
  render: function () {
    var todoItems = this.props.todos.map(function (todo, index) {
      return (
        <TodoItem text={todo.text}
                  done={todo.done}
                  id={index}
                  toggleTodo={this.props.toggleTodo}
        />
      );
    }.bind(this));

    var listDesc = 'All done!';
    var undoneCount = this.getUndoneCount();
    if (undoneCount) {
      listDesc = 'You have ' + undoneCount + ' remaining tasks';
    }

    return (
      <div>
        <ul style={{listStyle: 'none', paddingLeft: 10}}>
          {todoItems}
        </ul>
        <span>{listDesc}</span>
      </div>
    );
  },

  getUndoneCount: function () {
    return this.props.todos.reduce(function (acc, todo) {
      return acc + (todo.done ? 0 : 1);
    }, 0);
  }
});

// View: Container components

var TodoApp = React.createClass({
  render: function () {
    return (
      <div>
        <TodoForm
            addTodo={this.props.addTodo}
            clearTodos={this.props.clearTodos}
        />
        <TodoList
            todos={this.props.todos}
            toggleTodo={this.props.toggleTodo}
        />
      </div>
    );
  }
});

var mapStateToProps = function (state) {
  return { todos: state.todos };
};
var FinalTodoApp = ReactRedux.connect(
  mapStateToProps,
  todoActionCreators
)(TodoApp);

React.render(
  <ReactRedux.Provider store={store}>
    <FinalTodoApp />
  </ReactRedux.Provider>,
  document.querySelector('#todo-container')
);
