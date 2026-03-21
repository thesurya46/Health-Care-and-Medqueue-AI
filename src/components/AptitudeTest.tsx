import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface AptitudeTestProps {
    onComplete?: (results?: SkillResults) => void;
}

export interface SkillResults {
    logical: number;
    numerical: number;
    verbal: number;
    creative: number;
    interpersonal: number;
    practical: number;
}

const AptitudeTest = ({ onComplete }: AptitudeTestProps) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number[]>>({
        logical: [],
        numerical: [],
        verbal: [],
        creative: [],
        interpersonal: [],
        practical: []
    });

    // Comprehensive question bank with different categories
    const questionBank = {
        logical: [
            "You enjoy solving complex puzzles and logical problems.",
            "You prefer systematic analysis over intuitive decisions.",
            "You find debugging code or finding errors satisfying.",
            "Abstract thinking comes naturally to you.",
            "You like to understand how things work internally."
        ],
        numerical: [
            "You find it easy to spot patterns in numbers and sequences.",
            "Mental math calculations are comfortable for you.",
            "You enjoy working with statistics and data analysis.",
            "You prefer quantitative reasoning over qualitative.",
            "Charts and graphs help you understand information better."
        ],
        verbal: [
            "You express your ideas clearly in writing.",
            "You enjoy reading and analyzing written content.",
            "You're comfortable presenting ideas to groups.",
            "You can explain complex topics in simple terms.",
            "Language and communication fascinate you."
        ],
        creative: [
            "You prefer brainstorming new ideas over analyzing existing ones.",
            "You think outside conventional boundaries.",
            "Visual or artistic expression appeals to you.",
            "You enjoy experimenting with new approaches.",
            "Innovation excites you more than optimization."
        ],
        interpersonal: [
            "You enjoy working in team environments.",
            "Understanding others' perspectives comes naturally.",
            "You're energized by social interactions.",
            "Leadership roles appeal to you.",
            "Collaboration is more effective than solo work for you."
        ],
        practical: [
            "Hands-on experience teaches you better than theory.",
            "You prefer concrete examples over abstract concepts.",
            "Real-world applications interest you more than theory.",
            "Building or creating physical things is satisfying.",
            "You learn best by doing rather than observing."
        ]
    };

    // Randomly select 15 questions from different categories
    const [questions] = useState(() => {
        const allQuestions: Array<{ q: string, type: string, category: string }> = [];

        Object.entries(questionBank).forEach(([type, qs]) => {
            // Pick 2-3 random questions from each category
            const shuffled = [...qs].sort(() => 0.5 - Math.random());
            shuffled.slice(0, 2).forEach(q => {
                allQuestions.push({
                    q,
                    type: type.charAt(0).toUpperCase() + type.slice(1),
                    category: type
                });
            });
        });

        // Shuffle all questions
        return allQuestions.sort(() => 0.5 - Math.random()).slice(0, 15);
    });

    const handleAnswer = (answerIndex: number) => {
        const currentQuestion = questions[step];
        const category = currentQuestion.category;

        // Record answer (0=Strongly Disagree, 1=Disagree, 2=Agree, 3=Strongly Agree)
        setAnswers(prev => ({
            ...prev,
            [category]: [...prev[category], answerIndex]
        }));

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            // Calculate final scores
            const results = calculateScores();
            setStep(-1); // Go to finish screen

            // Wait a moment before calling onComplete
            setTimeout(() => {
                onComplete?.(results);
            }, 100);
        }
    };

    const calculateScores = (): SkillResults => {
        const scores: SkillResults = {
            logical: 0,
            numerical: 0,
            verbal: 0,
            creative: 0,
            interpersonal: 0,
            practical: 0
        };

        // Calculate percentage for each category based on answers
        Object.keys(answers).forEach((category) => {
            const categoryAnswers = answers[category];
            if (categoryAnswers.length > 0) {
                // Sum all answers and convert to percentage
                const sum = categoryAnswers.reduce((acc, val) => acc + val, 0);
                const maxPossible = categoryAnswers.length * 3; // 3 is max score per question
                const percentage = Math.round((sum / maxPossible) * 100);
                scores[category as keyof SkillResults] = percentage;
            }
        });

        return scores;
    };

    // Calculate progress percentage
    const progress = ((step + 1) / questions.length) * 100;

    const answerOptions = ['Strongly Disagree', 'Disagree', 'Agree', 'Strongly Agree'];

    return (
        <div className="glass rounded-[2rem] p-10 max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {step >= 0 ? (
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <span>Section: {questions[step].type}</span>
                                <span>Question {step + 1}/{questions.length}</span>
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-secondary to-green-400"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold leading-tight">
                            {questions[step].q}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {answerOptions.map((opt, index) => (
                                <button
                                    key={opt}
                                    onClick={() => handleAnswer(index)}
                                    className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-secondary/10 hover:border-secondary/30 transition-all text-sm font-medium hover:scale-105 active:scale-95"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>

                        {/* Question tips */}
                        <p className="text-xs text-gray-500 text-center italic">
                            Answer honestly - there are no right or wrong answers
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="finish"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10"
                    >
                        <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary">
                            <CheckCircle2 size={40} />
                        </div>
                        <h3 className="text-3xl font-bold mb-4">Assessment Complete!</h3>
                        <p className="text-gray-400 mb-4">
                            Our AI is analyzing your profile across {Object.keys(questionBank).length} competency areas.
                        </p>
                        <p className="text-sm text-secondary font-semibold mb-8">
                            🧠 Career Match Analysis In Progress...
                        </p>
                        <button
                            onClick={() => onComplete?.(calculateScores())}
                            className="btn-secondary"
                        >
                            View Results
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AptitudeTest;
