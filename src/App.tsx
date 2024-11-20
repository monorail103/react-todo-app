import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import { Todo } from './types';

const taskEndDate = ({ deadline }: Todo): string => {
  dayjs.locale(ja);
  const now = dayjs();
  const end = dayjs(deadline);
  const diffHours = now.diff(end, 'hour');

  if(Math.abs(diffHours) === 0) {
    return `（現在時間が期限）`;
  }
  return `${now < end ? `（残り${Math.abs(diffHours)}時間` : `期限を${diffHours}時間超過`}）`;
};

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [newPriority, setNewPriority] = useState<number>(1);
  const [newDeadline, setNewDeadline] = useState<Date>(new Date());
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [sortMethod, setSortMethod] = useState<string>('priority');

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    console.log('Loaded todos from localStorage:', savedTodos);
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    if (todos.length > 0) {
      console.log('Saving todos to localStorage:', todos);
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    const newTodoItem: Todo = {
        id: todos.length + 1, 
        name: newTodo,
        priority: newPriority,
        isDone: false,
        deadline: newDeadline,
    };
    setTodos([...todos, newTodoItem]);
    setNewTodo('');
  };

  const toggleTodo = (id: number) => {
    // 削除
    const setTodo = localStorage.getItem('todos');
    if (setTodo) {
      const todosArray: Todo[] = JSON.parse(setTodo);
      const updatedTodos = todosArray.filter(todo => todo.id !== id);
      setTodos(updatedTodos);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
    }
  };

  const editTodo = (id: number, name: string, priority: number, deadline: Date) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, name, priority, deadline, isDone: false } : todo
    );
    setTodos(updatedTodos);
    setEditingTodoId(null);
  };

  const sortTodos = (method: string) => {
    const sortedTodos = [...todos].sort((a, b) => {
      switch (method) {
        case 'priority':
          return b.priority - a.priority;
        case 'deadline':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        default:
          return a.id - b.id;
      }
    });
    setTodos(sortedTodos);
    setSortMethod(method);
  };

  return (
    <>
      <div className='mt-10 mx-10'>
        <h1 className='font-bold text-2xl mb-4'>Todo List</h1>
        <div className='flex items-center'>
        <label className="mr-2">題名:</label>
          <input
            type="text"
            value={newTodo}
            className='border border-gray-300 rounded-md p-1'
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <br />
            <label className="mr-2">優先度:</label>
            <input
            type="number"
            value={newPriority}
            min={1}
            className='border border-gray-300 rounded-md p-1'
            onChange={(e) => setNewPriority(parseInt(e.target.value))}
            />
            <br />
            <input
            type="datetime-local"
            value={dayjs(new Date()).format('YYYY-MM-DDTHH:mm')}
            className='border border-gray-300 rounded-md p-1'
            onChange={(e) => setNewDeadline(new Date(e.target.value))}
            />
            <br />
          <button 
            onClick={addTodo} 
            className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md'>
            追加
          </button>
          <button 
            onClick={() => sortTodos(sortMethod === 'priority' ? 'deadline' : 'priority')} 
            className='ml-2 bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-md'>
            {sortMethod === 'priority' ? '期限' : '優先度'}順
          </button>
        </div>
        <br />
        <ul className='mt-4 items-baseline'>
          { todos.length === 0 ? (
            <li className='text-gray-500'>現在、タスクはありません。</li>
          ) : (todos.map(todo => (
              <li 
                className= 'bg-gray-100 p-2 rounded-md mb-2 shadow-md flex items-baseline'
                key={todo.id} 
                style={{ 
                  textDecoration: todo.isDone ? 'line-through' : 'none',
                  fontWeight: todo.priority >= 3 ? 'bold' : 'normal',
                  color: todo.deadline < new Date() ? 'red' : 'black',
                }}
              >
              {editingTodoId === todo.id ? (
                <>
                  <input
                    type="text"
                    value={todo.name}
                    className='border border-gray-300 rounded-md p-1'
                    onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, name: e.target.value } : t))}
                  />
                  <input
                    type="number"
                    value={todo.priority}
                    min={1}
                    className='border border-gray-300 rounded-md p-1'
                    onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, priority: parseInt(e.target.value) } : t))}
                  />
                  <input
                    type="datetime-local"
                    value={new Date(todo.deadline).toISOString().slice(0, 16)}
                    className='border border-gray-300 rounded-md p-1'
                    onChange={(e) => setTodos(todos.map(t => t.id === todo.id ? { ...t, deadline: new Date(e.target.value) } : t))}
                  />
                  <input
                    type='button'
                    value='保存'
                    className='bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded-md ml-2 text-sm'
                    onClick={() => {
                      setEditingTodoId(null);
                      editTodo(todo.id, todo.name, todo.priority, new Date(todo.deadline));
                    }}
                  />
                </>
              ) : (
                <>
                  {todo.name}  
                  <div className="ml-2 text-orange-600">
                    {'★'.repeat(todo.priority)} 
                  </div>
                  <div className='ml-2 text-blue-600'>
                    期限: {dayjs(todo.deadline).format("YYYY/MM/DD(ddd) HH:mm")}
                  </div>
                  {taskEndDate(todo)}
                  <button 
                    className='bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded-md ml-2 text-sm'
                    onClick={() => setEditingTodoId(todo.id)}
                  >
                    <FontAwesomeIcon icon={faEdit} size="1x"/>
                  </button>
                  <button 
                    className='bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded-md ml-2 text-sm'
                    onClick={() => toggleTodo(todo.id)}
                  >
                    <FontAwesomeIcon icon={faCheck} size="1x"/>
                  </button>
                </>
              )}
              </li>
          )))}
        </ul>
      </div>
    </>
  );
};

export default TodoApp;