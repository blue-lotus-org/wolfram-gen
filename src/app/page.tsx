'use client';

import {useState, useEffect, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {generateFormula} from '@/ai/flows/generate-formula';
import {generateStepByStepSolution} from '@/ai/flows/generate-step-by-step-solution';
import {Icons} from '@/components/icons';
import {Toaster} from "@/components/ui/toaster";
import {useToast} from "@/hooks/use-toast";

const MathChat = () => {
  const [apiKey, setApiKey] = useState('');
  const [question, setQuestion] = useState('');
  const [formula, setFormula] = useState<string | null>(null);
  const [stepByStepSolution, setStepByStepSolution] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [chatMessages, setChatMessages] = useState<
    {
      type: 'user' | 'ai';
      content: string;
    }[]
  >([]);

  const {toast} = useToast();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('apiKey', apiKey);
    toast({
      title: "API Key Saved",
      description: "Your API key has been successfully saved.",
    })
  };

  const handleQuestionSubmit = async () => {
    if (!apiKey) {
      alert('Please enter and save your API key first.');
      return;
    }
    if (!question) {
      alert('Please enter a math question.');
      return;
    }

    setChatMessages(prevMessages => [...prevMessages, {type: 'user', content: question}]);

    try {
      const formulaResult = await generateFormula({question});
      setFormula(formulaResult.formula);
      setChatMessages(prevMessages => [
        ...prevMessages,
        {type: 'ai', content: `Wolfram Language Formula: ${formulaResult.formula}`},
      ]);

      // Decide whether to generate a step-by-step solution
      if (formulaResult.formula) {
        const stepByStepResult = await generateStepByStepSolution({
          problem: question,
          wolframFormula: formulaResult.formula,
        });
        setStepByStepSolution(stepByStepResult.stepByStepSolution);
        setChatMessages(prevMessages => [
          ...prevMessages,
          {type: 'ai', content: `Step-by-step solution: ${stepByStepResult.stepByStepSolution}`},
        ]);
      }
    } catch (error: any) {
      console.error('Error generating formula or solution:', error);
      setChatMessages(prevMessages => [
        ...prevMessages,
        {type: 'ai', content: `Error: ${error.message || 'Failed to process your question.'}`},
      ]);
    } finally {
      setQuestion(''); // Clear the input after processing
      // Scroll to the bottom of the chat interface after adding a new message
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-mathchat-primary text-mathchat-secondary p-4">
      <Toaster />
      <div className="max-w-3xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-center mb-4">MathChat</h1>

        {/* API Key Storage */}
        <Card className="mb-4">
          <CardContent className="flex flex-col space-y-2">
            <Label htmlFor="apiKey">AI API Key:</Label>
            <div className="flex space-x-2">
              <Input
                type="password"
                id="apiKey"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <Button onClick={saveApiKey}>Save</Button>
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="mb-4">
          <CardContent className="flex flex-col">
            <div className="mb-2" ref={chatContainerRef} style={{overflowY: 'auto', maxHeight: '300px'}}>
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-2 p-3 rounded-lg ${
                    message.type === 'user' ? 'bg-gray-100 text-gray-700 self-end' : 'bg-teal-100 text-teal-700 self-start'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Textarea
                placeholder="Ask a math question..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleQuestionSubmit();
                  }
                }}
              />
              <Button onClick={handleQuestionSubmit}>
                <Icons.arrowRight className="w-4 h-4 mr-2"/>
                Ask
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formula Display */}
        {formula && (
          <Card className="mb-4">
            <CardContent>
              <Label>Generated Formula:</Label>
              <div className="whitespace-pre-line">{formula}</div>
            </CardContent>
          </Card>
        )}

        {/* Step-by-step Solution */}
        {stepByStepSolution && (
          <Card>
            <CardContent>
              <Label>Step-by-step Solution:</Label>
              <div className="whitespace-pre-line">{stepByStepSolution}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MathChat;

