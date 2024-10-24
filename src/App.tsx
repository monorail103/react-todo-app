import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import ja from 'dayjs/locale/ja';
import { Todo } from './types';

export const taskEndDate = ({ deadline, isDone, priority, name }: Todo): string => {
  dayjs.locale(ja);
  const now = dayjs();
  const end = dayjs(deadline);
  const diffHours = now.diff(end, 'hour');

  return `【${isDone ? "済" : "未"}】 ${name} ${'★'.repeat(priority)} （${now < end ? `期限まで残り${Math.abs(diffHours)}時間` : `期限を${diffHours}時間超過`}）`;
};

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [newPriority, setNewPriority] = useState<number>(1);
  const [newDeadline, setNewDeadline] = useState<Date>(new Date());

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
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
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
            value={newDeadline.toISOString().split('T')[0]}
            className='border border-gray-300 rounded-md p-1'
            onChange={(e) => setNewDeadline(new Date(e.target.value))}
          />
          <br />
          <button 
            onClick={addTodo} 
            className='bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md'>
            Add Todo
          </button>
        </div>
        <br />
        <ul className='mt-4 items-baseline'>
          {todos.map(todo => (
              <li 
                className= 'bg-gray-200 p-2 rounded-md mb-2 shadow-md flex justify-between items-center'
                key={todo.id} 
                style={{ 
                  textDecoration: todo.isDone ? 'line-through' : 'none',
                  fontWeight: todo.priority >= 3 ? 'bold' : 'normal',
                  color: todo.priority >= 4 ? 'red' : 'black',
                }}
              >
              {taskEndDate(todo)}
              <button 
                className='bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded-md ml-2 text-sm'
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.isDone ? 'Undo' : 'Complete'}
              </button>
              </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default TodoApp
