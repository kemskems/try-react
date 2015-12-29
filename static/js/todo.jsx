// Dispatcher

var alt = new Alt();

// Actions

var TodoActions = alt.createActions({
  addTodo: function (text) {
    return text;
  },

  toggleTodo: function (id) {
    return id;
  },

  clearTodos: function () {
    // Action MUST return so it will dispatch
    return true;
  }
});

// Store

var TodoStore = alt.createStore({
  displayName: 'TodoStore',

  bindListeners: {
    handleAddTodo: TodoActions.addTodo,
    handleToggleTodo: TodoActions.toggleTodo,
    handleClearTodos: TodoActions.clearTodos
  },

  state: {
    todos: [
      {text: 'Makan siang', done: false},
      {text: 'Beli baju', done: true}
    ]
  },

  publicMethods: {
    getTodos: function () {
      return this.state.todos;
    }
  },

  handleAddTodo: function (text) {
    var todos = this.state.todos;
    todos.push({text: text, done: false});
    this.setState({todos: todos});
  },

  handleToggleTodo: function (id) {
    var todos = this.state.todos;
    todos[id].done = !todos[id].done;
    this.setState({todos: todos});
  },

  handleClearTodos: function () {
    var newTodos = this.state.todos.filter(function (todo) {
      return !todo.done;
    });
    this.setState({todos: newTodos});
  }
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
    TodoActions.toggleTodo(this.props.id);
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

    TodoActions.addTodo(this.state.text);

    this.setState({text: ''});
  },

  _onClick: function () {
    TodoActions.clearTodos();
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
    });

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

var TodoApp = React.createClass({
  getInitialState: function () {
    return TodoStore.getState();
  },

  componentDidMount: function () {
    TodoStore.listen(this._onChange);
  },

  componentWillUnmount: function () {
    TodoStore.unlisten(this._onChange);
  },

  render: function () {
    return (
      <div>
        <TodoForm />
        <TodoList todos={this.state.todos} />
      </div>
    );
  },

  _onChange: function (state) {
    this.setState(state);
  }
});

React.render(
  <TodoApp />,
  document.querySelector('#todo-container')
);
