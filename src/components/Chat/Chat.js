import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import InforBar from "../InforBar/InfoBar";
import Input from "../Input/Input";
import Messages from "../Messages/Messages";
import TextContainer from "../TextContainer/TextContainer";
import "./Chat.css";

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState("");
  //const ENDPOINT = "localhost:5000";
  const ENDPOINT = "https://react-chat-guru.herokuapp.com/";

  useEffect(() => {
    // retreive the data that the users have entered
    // location comes from react router from the prop
    // the name and room is being restrieved as an object
    const { name, room } = queryString.parse(location.search);

    // first connection
    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);

    // emit different evnets
    // event name: join
    // {name, room} is an object that will be send to the backend
    socket.emit(
      "join",
      {
        name,
        room,
      },
      () => {}
    );

    // clean up and unmounting
    return () => {
      // disconnect
      socket.emit("disconnect");
      // turn this socket instance off
      socket.off();
    };

    // only if these two values change, re-render the useEffect
  }, [ENDPOINT, location.search]);

  // handling message and send message useEffect
  useEffect(() => {
    // listen for message
    socket.on("message", (message) => {
      // push message to messages array
      setMessages([...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
    });
  }, [messages]);

  // sending messages
  const sendMessage = (event) => {
    // prevent refresh
    event.preventDefault();
    if (message) {
      socket.emit("sendMessage", message, () => setMessage(""));
    }
  };

  return (
    <div className="outerContainer">
      <div className="container">
        <InforBar room={room} />
        <Messages messages={messages} name={name} />
        <Input
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
        {/* <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyPress={(event) =>
            event.key === "Enter" ? sendMessage(event) : null
          }
        /> */}
      </div>
      <TextContainer users={users} />
    </div>
  );
};

export default Chat;
