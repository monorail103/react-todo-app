import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faCheck, faCalendar } from "@fortawesome/free-solid-svg-icons";
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
              <FontAwesomeIcon icon={faCheck}  className="mr-1" size="1x"/>
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
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.isDone ? 'Undo' : 'Complete'}
              </button>
              </li>
          )))}
        </ul>
      </div>
    </>
  );
};

export default TodoApp
