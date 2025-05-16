import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { io } from "socket.io-client";

function App() {
  const [count, setCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const [messages, setMessages] = useState([]);

  const [username, setUsername] = useState('');
  const isUsernameEmpty = !username.trim();
  const [userInput, setUserInput] = useState('');
  const isUserInputEmpty = !userInput;

  const [socket, setSocket] = useState(null);

  const [isLogined, setIsLogined] = useState(false);

  const chatListRef = useRef(null);
  

  function connectToChatServer(){

    if(isUsernameEmpty){
      alert('닉네임을 입력해주세요.');
    }else{
      const _socket = io('http://13.125.210.159:3000', {
        autoConnect: false,
        query: {
          username: username
        }
      });
      _socket.connect();
      setSocket(_socket);
      setIsLogined(true);
    }
  }

  function disConnectToChatServer(){
    socket?.disconnect();
    setIsLogined(false);
    setUsername('');
    setMessages([]);
  }

  function onConnected(){
    setIsConnected(true);
  }

  function onDisconnected(){
    setIsConnected(false);
  }

  function sendMessageToChatServer(event){
    event.preventDefault();
    setUserInput('');
    if(!isConnected){
      alert('상단에 닉네임을 입력 후 접속해주세요.');
    }
    
    if(isConnected && !isUserInputEmpty){
      socket?.emit("new message", {username:username, message:userInput}, (response) => {
        console.log(response);
      });
    }
  }

  function onMessageReceived(msg){
    setMessages(previous => [...previous, msg]);
  }

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [messages]); // messages가 변경될 때마다 실행됨

  useEffect(() => {
    console.log('useEffect called!');
    socket?.on('connect', onConnected);
    socket?.on('disconnect', onDisconnected);
    
    socket?.on('new message', onMessageReceived);

    return () => {
      console.log('useEffect clean up function called!');
      socket?.off('connect', onConnected);
      socket?.off('disconnect', onDisconnected);
      socket?.off('new message', onMessageReceived);
    };
  }, [socket]);

  const messageList = messages.map((aMsg, index) =>
    <div key={index}>
      {aMsg.username} : {aMsg.message}
    </div>
  );

  const showLoginLayer = () => {
    if(!isLogined){
      return (
        <>
          <input value={username} onChange={e => setUsername(e.target.value)}/>
          <button onClick={() => connectToChatServer()}>접속</button>
        </>
      );
    }else{
      return <button onClick={() => disConnectToChatServer()}>접속종료</button>;
    }
  }

  return (
    <>
      <div className="navbar">
        <h1>유저: {username}</h1>
        <h2>현재 접속상태: {isConnected ? "접속중" : "미접속"}</h2>
        <div className="card">
          {showLoginLayer()}
        </div>
      </div>

      <div ref={chatListRef} className="chatList">
        {messageList}
      </div>

      <form className="messageInput" onSubmit={event => sendMessageToChatServer(event)}>
        <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)}/>
        <button type="submit">
          보내기
        </button>
      </form>
    </>
  )
}

export default App
