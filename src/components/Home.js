import React, { useState, useEffect, useRef } from 'react';

import './Home.css';

const commands = {
  about: "I'm Andrei Danila, an ML Researcher/Engineer and recent graduate from Imperial College London.",
  skills: "My skills include: PyTorch, HuggingFace, CUDA, GCP, and more.",
  research: "I specialize in language transformers and text comparison techniques. My latest work involves using Wiener Filters for embedded text comparison and will soon be available on arXiv.",
  contact: "You can reach me at:\nEmail: andrei.c.danila@gmail.com\nLinkedIn: https://www.linkedin.com/in/andreidanila10052000/",
  help: "Available commands: about, skills, research, contact, pwd, clear",
  pwd: "~/Earth/UnitedKingdom/London"
};

function Home() {
  const welcomeMessage = ['Welcome to my website', 'Type \'help\' for available commands.'];
  const [output, setOutput] = useState(welcomeMessage);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef(null);
  const maxHistoryLength = 30;
  const [inputIsValid, setInputIsValid] = useState(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearTerminal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [output]);

  const processCommand = (command) => {
    const lowercaseCommand = command.toLowerCase().trim();

    if (lowercaseCommand === 'clear') {
      setOutput([]);
      return;
    }

    let response;
    if (lowercaseCommand in commands) {
      response = commands[lowercaseCommand];
      if (lowercaseCommand === 'contact') {
        response = response.split('\n').map((line, index) => {
          if (line.startsWith('Email:')) {
            return <div key={index}>{line}</div>;
          } else if (line.startsWith('LinkedIn:')) {
            const url = line.split(': ')[1];
            return (
              <div key={index}>
                LinkedIn: <a href={url} target="_blank" rel="noopener noreferrer" className="terminal-link">{url}</a>
              </div>
            );
          }
          return <div key={index}>{line}</div>;
        });
      }
    } else {
      response = `Command not found: ${command}. Type 'help' for available commands.`;
    }

    setOutput(prev => [...prev, `$ ${command}`, response]);
    setCommandHistory(prev => {
      const newHistory = [command, ...prev.filter(cmd => cmd !== command)].slice(0, maxHistoryLength);
      return newHistory;
    });
    setHistoryIndex(-1);
  };

  const validateInput = (input) => {
    const trimmedInput = input.trim().toLowerCase();
    return trimmedInput === 'clear' || trimmedInput in commands;
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setInputIsValid(newValue.trim() === '' ? null : validateInput(newValue));
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      processCommand(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputSubmit(e);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex(prevIndex => prevIndex + 1);
        setInputValue(commandHistory[historyIndex + 1]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > -1) {
        setHistoryIndex(prevIndex => prevIndex - 1);
        setInputValue(historyIndex - 1 >= 0 ? commandHistory[historyIndex - 1] : '');
      }
    }
  };

  const clearTerminal = () => {
    setOutput([]);
  };

  console.log('Welcome message:', welcomeMessage);

  return (
    <div className="terminal-window">
      <div className="terminal-header">
        <span className="button red"></span>
        <span className="button yellow"></span>
        <span className="button green"></span>
      </div>
      <div className="terminal-body" ref={outputRef}>
        <div className="terminal-content">
          {output.map((line, index) => (
            <div key={`output-${index}`} className="output-line">{line}</div>
          ))}
        </div>
        <form onSubmit={handleInputSubmit} className="input-line">
          <span className="prompt">$</span>
          <input
            type="text"
            id="user-input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className={inputIsValid === null ? '' : inputIsValid ? 'valid-command' : 'invalid-command'}
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}

export default Home;
