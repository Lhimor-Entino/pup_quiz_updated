import React, { useState } from 'react';
import { Clock, Plus, Trash2, Save } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Props {
    show: boolean,
    setShow: (arg: boolean) => void,
    question: any
}
export default function EditModal(props: Props) {
    const { show, setShow, question } = props
    const [formData, setFormData] = useState(question);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOptionChange = (index, field, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = {
            ...newOptions[index],
            [field]: value
        };
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { text: "", isCorrect: false }]
        }));
    };

    const removeOption = (index) => {
        if (formData.options.length > 2) {
            const newOptions = formData.options.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                options: newOptions
            }));
        }
    };

    const setCorrectAnswer = (index) => {
        const newOptions = formData.options.map((option, i) => ({
            ...option,
            isCorrect: i === index
        }));
        setFormData(prev => ({
            ...prev,
            options: newOptions
        }));
    };

    const handleSave = async () => {
        console.log('Saved data:', formData);
      
        try {

     
            const res = await axios.post("/question/edit", formData)

            if (res.data == 1) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Question Updated Successfully',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: '#fff',
                    color: '#399918',
                    iconColor: '#399918 ',
                });
                setTimeout(()=>{
                        window.location.reload()
                },500)
            }
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <Dialog open={show} onOpenChange={() => setShow(!show)}>
            <DialogContent className="sm:max-w-[425px] min-w-[900px] max-h-[960px]  overflow-auto">
                <DialogHeader>
                    <DialogTitle>Edit Question</DialogTitle>
                    <DialogDescription>
                        Make changes to question here. Click save when you&apos;re
                        done.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-w-4xl w-full mx-auto bg-white">


                    <div className="bg-gray-50 p-6 rounded-b-lg border">
                        {/* Basic Information */}


                        {/* Question */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question
                            </label>
                            <textarea
                                value={formData.question}
                                onChange={(e) => handleInputChange('question', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your question here..."
                            />
                        </div>

                        {/* Settings Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Difficulty
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="average">Average</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => handleInputChange('points', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Clock className="inline w-4 h-4 mr-1" />
                                    Time Limit (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={formData.timeLimit}
                                    onChange={(e) => handleInputChange('timeLimit', e.target.value)}
                                    min="1"
                                    max="120"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Options Section */}
                        {formData.type === 'multiple-choice' && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Answer Options</h3>
                                    <button
                                        onClick={addOption}
                                        className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Option
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.options.map((option, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white">
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={option.isCorrect}
                                                    onChange={() => setCorrectAnswer(index)}
                                                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Correct</span>
                                            </div>

                                            <input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            />

                                            {formData.options.length > 2 && (
                                                <button
                                                    onClick={() => removeOption(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Short Answer Section */}
                        {formData.type === 'short-answer' && (
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Correct Answer</h3>
                                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Expected Answer
                                    </label>
                                    <textarea
                                        value={formData.shortAnswer || ''}
                                        onChange={(e) => handleInputChange('shortAnswer', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Enter the correct answer for this question..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        This will be used to evaluate student responses (case-insensitive matching)
                                    </p>
                                </div>
                            </div>
                        )}
            
                        {/* True/False Section */}
                        {formData.type === 'true-false' && (
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Correct Answer</h3>
                                <div className="bg-white p-4 border border-gray-200 rounded-lg">
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="trueFalseAnswer"
                                                value="1"
                                                checked={formData.trueFalseAnswer == 1}
                                                onChange={() => handleInputChange('trueFalseAnswer', true)}
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700">True</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="trueFalseAnswer"
                                                value="0"
                                                checked={formData.trueFalseAnswer == 0}
                                                onChange={() => handleInputChange('trueFalseAnswer', false)}
                                                className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                            />
                                            <span className="ml-2 text-sm font-medium text-gray-700">False</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Question
                            </button>
                        </div>

                        {/* Preview */}
                         {formData.type === 'multiple-choice' && 
                           <div className="mt-8 p-4 bg-orange-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                            <div className="text-sm text-gray-600">
                                <p><strong>Q{formData.id}:</strong> {formData.question}</p>
                                <p><strong>Difficulty:</strong> {formData.difficulty} | <strong>Time:</strong> {formData.timeLimit} min | <strong>Points:</strong> {formData.points}</p>
                                {formData.options.length > 0 && (
                                    <div className="mt-2">
                                        <strong>Options:</strong>
                                        <ul className="list-disc list-inside ml-4">
                                            {formData.options.map((option, index) => (
                                                <li key={index} className={option.isCorrect ? 'text-orange-600 font-medium' : ''}>
                                                    {option.text} {option.isCorrect && '✓'}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>}
                      
                    </div>
                </div>
            </DialogContent>

        </Dialog>

    );
}