// Dispatcher

var TodoDispatcher = new Flux.Dispatcher();

// Actions

var ACTION_TYPES = {
  ADD_TODO: 'ADD_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  CLEAR_TODOS: 'CLEAR_TODOS'
};

var actions = {
  addTodo: function (text) {
    TodoDispatcher.dispatch({
      actionType: ACTION_TYPES.ADD_TODO,
      todoText: text
    });
  },

  toggleTodo: function (id) {
    TodoDispatcher.dispatch({
      actionType: ACTION_TYPES.TOGGLE_TODO,
      todoId: id
    });
  },

  clearTodos: function () {
    TodoDispatcher.dispatch({
      actionType: ACTION_TYPES.CLEAR_TODOS
    });
  }
};

// Store

var data = [
  {text: 'Makan siang', done: false},
  {text: 'Beli baju', done: true}
];

var TodoStore = Object.create(EventEmitter.prototype, {
  getTodos: {
    value: function () {
      return data;
    }
  },

  getUndoneCount: {
    value: function () {
      return data.reduce(function (acc, todo) {
        return acc + (todo.done ? 0 : 1);
      }, 0);
    }
  },

  emitChange: {
    value: function () {
      this.emitEvent('change');
    }
  },

  addChangeListener: {
    value: function (listener) {
      this.addListener('change', listener);
    }
  },

  removeChangeListener: {
    value: function (listener) {
      this.removeListener('change', listener);
    }
  }
});

TodoStore.dispatchToken = TodoDispatcher.register(function (payload) {
  switch (payload.actionType) {
    case ACTION_TYPES.ADD_TODO:
      data.push({
        text: payload.todoText,
        done: false
      });
      break;

    case ACTION_TYPES.TOGGLE_TODO:
      var id = payload.todoId;
      data[id].done = !data[id].done;
      break;

    case ACTION_TYPES.CLEAR_TODOS:
      data = data.filter(function (todo) {
        return !todo.done;
      });
      break;

    default:
      return true;
  }

  TodoStore.emitChange();
  return true;
});

// View

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
    actions.toggleTodo(this.props.id);
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

    actions.addTodo(this.state.text);

    this.setState({text: ''});
  },

  _onClick: function () {
    actions.clearTodos();
  }
});

var TodoList = React.createClass({
  render: function () {
    var todoItems = this.props.todos.map(function (todo, index) {
      return (
        <TodoItem text={todo.text}
                  done={todo.done}
                  id={index}
        />
      );
    }.bind(this));

    var listDesc = 'All done!';
    var undoneCount = TodoStore.getUndoneCount();
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
  }
});

var TodoApp = React.createClass({
  getInitialState: function () {
    return {todos: TodoStore.getTodos()};
  },

  componentDidMount: function () {
    TodoStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function () {
    TodoStore.removeChangeListener(this._onChange);
  },

  render: function () {
    return (
      <div>
        <TodoForm />
        <TodoList todos={this.state.todos} />
      </div>
    );
  },

  _onChange: function () {
    this.setState({todos: TodoStore.getTodos()});
  }
});

React.render(
  <TodoApp />,
  document.querySelector('#todo-container')
);
