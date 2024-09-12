import React, { useState, useEffect, useRef } from 'react';

import './Home.css';

const commands = {
  about: "I'm Andrei Danila, an ML Researcher/Engineer and recent graduate from Imperial College London. I consider myself a full-stack ML developer, with a special interest in SOTA models and their applications.",
  skills: "Machine Learning: Deep Learning (NLP, Vision, Generative), LLMs, classic ML \nTech stack: PyTorch, Tensorflow, HuggingFace, CUDA (C/C++), Google Cloud Platform, Docker, HPC.",
  projects: [
    "1. Convolution Revolution: Wiener Filters for Embedded Text Comparison | Preprint:https://drive.google.com/file/d/1_d4VhU7QTNKGo7D7p5JyvcM21OTASp9r/view?usp=sharing | GitHub:https://github.com/edsml-acd23/convolution_revolution",
    "2. Job Prepr: Practice Video Interviews with AI | GitHub:https://github.com/edsml-acd23/job-prepr-model | YouTube:https://www.youtube.com/watch?t=4083&v=slVi4kWBiH4"
  ].join('\n'),
  contact: "You can reach me at:\nEmail: andrei.c.danila@gmail.com\nLinkedIn: https://www.linkedin.com/in/andreidanila10052000/",
  cv: "https://drive.google.com/file/d/1pl2eXsx_NE9-BxIFoF2GqlS-TaGA8S8i/view?usp=sharing",
  commands: "Available commands: about, skills, projects, contact, cv, pwd, clear, python",
  pwd: "~/Earth/UnitedKingdom/London",
  python: [
    '>>> import life',
    '>>> life.meaning()',
    '42',
    '>>> life.purpose()',
    '"To create more bugs for developers to fix"',
    '>>> import happiness',
    'ImportError: happiness module not found. Try "import coffee" instead.',
    '>>> import time',
    '>>> time.sleep(28800)  # Simulating a workday',
    'KeyboardInterrupt: User got bored and hit Ctrl+C',
    '>>> exit()',
    'Don\'t forget to touch grass!'
  ].join('\n'),
};

function Home() {
  const welcomeMessage = ['My name is Andrei Danila, a Machine Learning Researcher/Engineer.', 'Welcome to my website! It is an interactive CV, just start typing to see what I\'ve been up to.', 'Type \'commands\' to get started.'];
  const [output, setOutput] = useState(welcomeMessage);
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef(null);
  const maxHistoryLength = 30;
  const [inputIsValid, setInputIsValid] = useState(null);
  const inputRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [showStartTyping, setShowStartTyping] = useState(true);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        clearTerminal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', checkMobile);
    };
  }, [output]);

  const renderOutput = (text) => {
    return text.split('\n').map((line, index) => {
      if (line.includes('|')) {
        const parts = line.split('|');
        return (
          <div key={index} className="output-line">
            {parts.map((part, i) => {
              const trimmedPart = part.trim();
              if (trimmedPart.includes(':http')) {
                const [linkText, ...urlParts] = trimmedPart.split(':');
                const url = urlParts.join(':'); // Rejoin the URL parts in case there are colons in the URL
                return (
                  <React.Fragment key={i}>
                    {i > 0 && ' | '}
                    <a 
                      href={url}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="terminal-link"
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      {linkText}
                    </a>
                  </React.Fragment>
                );
              }
              return <React.Fragment key={i}>{i > 0 && ' | '}{trimmedPart}</React.Fragment>;
            })}
          </div>
        );
      }
      return <div key={index} className="output-line">{line}</div>;
    });
  };

  const processCommand = (command) => {
    const lowercaseCommand = command.toLowerCase().trim();
    const isValid = lowercaseCommand === 'clear' || lowercaseCommand in commands;

    if (lowercaseCommand === 'clear') {
      setOutput([]);
      return;
    }

    if (lowercaseCommand.includes('sudo')) {
      setOutput(prev => [...prev, `$ ${command}`, "Using sudo is forbidden. The administrator has been alerted!"]);
      return;
    }

    let response;
    if (lowercaseCommand in commands) {
      response = renderOutput(commands[lowercaseCommand]);
      if (lowercaseCommand === 'contact') {
        response = commands[lowercaseCommand].split('\n').map((line, index) => {
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
      response = `Command not found: ${command}. Type 'commands' for available commands.`;
    }

    setOutput(prev => [
      ...prev, 
      <div key={`command-${prev.length}`} className={`output-line ${isValid ? 'valid-command' : 'invalid-command'}`}>
        $ {command}
      </div>,
      response
    ]);
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

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setShowStartTyping(false);
    }
  };

  console.log('Welcome message:', welcomeMessage);

  return (
    <div className="terminal-container" style={{ backgroundColor: '#2d2d2d', padding: '20px', borderRadius: '10px' }}>
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
          {isMobile && showStartTyping && (
            <button className="start-typing-button" onClick={focusInput}>
              Start Typing
            </button>
          )}
          <form onSubmit={handleInputSubmit} className="input-line">
            <span className="prompt">$</span>
            <input
              type="text"
              id="user-input"
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowStartTyping(false)}
              className={inputIsValid === null ? '' : inputIsValid ? 'valid-command' : 'invalid-command'}
            />
            <button type="submit" className="enter-button">Enter</button>
          </form>
        </div>
      </div>
      <div className="external-links">
        <a 
          href="https://www.linkedin.com/in/andreidanila10052000/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="external-link"
        >
          LinkedIn
        </a>
        <span className="link-separator">|</span>
        <a 
          href="https://www.google.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="external-link"
        >
          CV
        </a>
      </div>
    </div>
  );
}

export default Home;
