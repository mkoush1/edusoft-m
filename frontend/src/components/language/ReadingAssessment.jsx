import React, { useState, useEffect } from 'react';
import CEFRService from '../../services/cefr.service';

const ReadingAssessment = ({ onComplete, level, language, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load questions based on language and level
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const assessmentData = await CEFRService.getAssessmentData(level, language, 'reading');
        if (assessmentData && assessmentData.questions) {
          setQuestions(assessmentData.questions);
          // Initialize answers array
          setAnswers(new Array(assessmentData.questions.length).fill(undefined));
          // Set timer based on level
          setTimeLeft(assessmentData.timeLimit || getTimeLimitByLevel(level));
        } else {
          // Fallback to local data if service returns nothing
          const fallbackQuestions = getQuestionsByLevelAndLanguage(level, language);
          setQuestions(fallbackQuestions);
          setAnswers(new Array(fallbackQuestions.length).fill(undefined));
          setTimeLeft(getTimeLimitByLevel(level));
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        // Fallback to local data on error
        const fallbackQuestions = getQuestionsByLevelAndLanguage(level, language);
        setQuestions(fallbackQuestions);
        setAnswers(new Array(fallbackQuestions.length).fill(undefined));
        setTimeLeft(getTimeLimitByLevel(level));
        setLoading(false);
      }
    };

    loadQuestions();
  }, [level, language]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const getTimeLimitByLevel = (level) => {
    const timeLimits = {
      'a1': 15 * 60, // 15 minutes
      'a2': 20 * 60,
      'b1': 30 * 60,
      'b2': 40 * 60,
      'c1': 50 * 60,
      'c2': 60 * 60 // 60 minutes
    };
    return timeLimits[level] || 30 * 60; // Default 30 minutes
  };

  const getQuestionsByLevelAndLanguage = (level, language) => {
    // In a real app, these would come from a database
    // We're simulating different questions for different levels
    
    const questionsByLevel = {
      'a1': [
        {
          id: 1,
          text: language === 'english' ? 
            'Read the following text: "John is a student. He studies at the university. He likes to read books."' : 
            'Lisez le texte suivant: "Jean est étudiant. Il étudie à l\'université. Il aime lire des livres."',
          question: language === 'english' ? 'What does John like to do?' : 'Qu\'est-ce que Jean aime faire?',
          options: language === 'english' ? 
            ['Study at university', 'Read books', 'Write essays', 'Play sports'] : 
            ['Étudier à l\'université', 'Lire des livres', 'Écrire des essais', 'Faire du sport'],
          correctAnswer: 1
        },
        {
          id: 2,
          text: language === 'english' ? 
            'Read the sign: "No smoking"' : 
            'Lisez le panneau: "Défense de fumer"',
          question: language === 'english' ? 'What is not allowed?' : 'Qu\'est-ce qui n\'est pas autorisé?',
          options: language === 'english' ? 
            ['Eating', 'Drinking', 'Smoking', 'Talking'] : 
            ['Manger', 'Boire', 'Fumer', 'Parler'],
          correctAnswer: 2
        },
        {
          id: 3,
          text: language === 'english' ? 
            'Read the menu: "Coffee - $2, Tea - $1.50, Water - $1"' : 
            'Lisez le menu: "Café - 2€, Thé - 1,50€, Eau - 1€"',
          question: language === 'english' ? 'Which is the most expensive?' : 'Quel est le plus cher?',
          options: language === 'english' ? 
            ['Coffee', 'Tea', 'Water', 'All are the same price'] : 
            ['Café', 'Thé', 'Eau', 'Tous ont le même prix'],
          correctAnswer: 0
        }
      ],
      'b1': [
        {
          id: 1,
          text: language === 'english' ? 
            'The Internet has transformed how we communicate. Social media platforms allow people to connect instantly across the globe. However, some critics argue that these digital connections are less meaningful than face-to-face interactions.' : 
            'Internet a transformé notre façon de communiquer. Les plateformes de médias sociaux permettent aux gens de se connecter instantanément à travers le monde. Cependant, certains critiques soutiennent que ces connexions numériques sont moins significatives que les interactions en face à face.',
          question: language === 'english' ? 'What concern do critics have about social media?' : 'Quelle préoccupation les critiques ont-ils concernant les médias sociaux?',
          options: language === 'english' ? 
            ['It is too expensive', 'It causes technical problems', 'Connections are less meaningful than in-person', 'It uses too much electricity'] : 
            ['C\'est trop cher', 'Cela cause des problèmes techniques', 'Les connexions sont moins significatives qu\'en personne', 'Cela utilise trop d\'électricité'],
          correctAnswer: 2
        },
        {
          id: 2,
          text: language === 'english' ? 
            'Climate change is one of the most pressing issues of our time. Rising global temperatures have led to more extreme weather events, including hurricanes, droughts, and floods. Many countries are now working to reduce carbon emissions.' : 
            'Le changement climatique est l\'un des problèmes les plus urgents de notre époque. La hausse des températures mondiales a entraîné des événements météorologiques plus extrêmes, notamment des ouragans, des sécheresses et des inondations. De nombreux pays travaillent maintenant à réduire les émissions de carbone.',
          question: language === 'english' ? 'What have rising global temperatures caused?' : 'Qu\'est-ce que la hausse des températures mondiales a causé?',
          options: language === 'english' ? 
            ['More international cooperation', 'Extreme weather events', 'Reduced energy costs', 'Better crop yields'] : 
            ['Plus de coopération internationale', 'Des événements météorologiques extrêmes', 'Réduction des coûts énergétiques', 'De meilleurs rendements des cultures'],
          correctAnswer: 1
        },
        {
          id: 3,
          text: language === 'english' ? 
            'Many nutritionists recommend eating a balanced diet that includes fruits, vegetables, whole grains, and lean proteins. Processed foods often contain high levels of sugar, salt, and unhealthy fats, which can contribute to health problems when consumed in excess.' : 
            'De nombreux nutritionnistes recommandent de manger un régime équilibré qui comprend des fruits, des légumes, des céréales complètes et des protéines maigres. Les aliments transformés contiennent souvent des niveaux élevés de sucre, de sel et de graisses malsaines, qui peuvent contribuer à des problèmes de santé lorsqu\'ils sont consommés en excès.',
          question: language === 'english' ? 'What potential issue is associated with processed foods?' : 'Quel problème potentiel est associé aux aliments transformés?',
          options: language === 'english' ? 
            ['They are too expensive', 'They spoil quickly', 'They contain unhealthy ingredients', 'They take too long to prepare'] : 
            ['Ils sont trop chers', 'Ils se gâtent rapidement', 'Ils contiennent des ingrédients malsains', 'Ils prennent trop de temps à préparer'],
          correctAnswer: 2
        }
      ],
      'c1': [
        {
          id: 1,
          text: language === 'english' ? 
            'The proliferation of artificial intelligence technologies has sparked vigorous debate among ethicists, technologists, and policymakers. While proponents highlight AI\'s potential to revolutionize healthcare, transportation, and other sectors, critics caution about unintended consequences, including algorithmic bias, privacy concerns, and potential job displacement. A nuanced regulatory framework that balances innovation with ethical considerations remains elusive but increasingly necessary.' : 
            'La prolifération des technologies d\'intelligence artificielle a suscité un vif débat parmi les éthiciens, les technologues et les décideurs politiques. Si les partisans soulignent le potentiel de l\'IA à révolutionner les soins de santé, les transports et d\'autres secteurs, les critiques mettent en garde contre les conséquences imprévues, notamment les biais algorithmiques, les problèmes de confidentialité et les déplacements d\'emplois potentiels. Un cadre réglementaire nuancé qui équilibre l\'innovation avec des considérations éthiques reste insaisissable mais de plus en plus nécessaire.',
          question: language === 'english' ? 'What remains challenging but increasingly important according to the text?' : 'Qu\'est-ce qui reste difficile mais de plus en plus important selon le texte?',
          options: language === 'english' ? 
            ['Developing faster AI algorithms', 'Creating more AI applications', 'Balancing innovation with ethical regulations', 'Reducing the cost of AI implementation'] : 
            ['Développer des algorithmes d\'IA plus rapides', 'Créer plus d\'applications d\'IA', 'Équilibrer l\'innovation avec des réglementations éthiques', 'Réduire le coût de mise en œuvre de l\'IA'],
          correctAnswer: 2
        },
        {
          id: 2,
          text: language === 'english' ? 
            'Contemporary literary criticism has evolved substantially since its formalist origins. Post-structuralist approaches challenge the notion of fixed textual meaning, while postcolonial critics examine literature through the lens of imperial power dynamics. Feminist literary theory interrogates gender representations, and digital humanities now employs computational methods to analyze vast textual corpora. These diverse methodologies reflect the field\'s adaptation to changing intellectual and cultural landscapes.' : 
            'La critique littéraire contemporaine a considérablement évolué depuis ses origines formalistes. Les approches post-structuralistes remettent en question la notion de signification textuelle fixe, tandis que les critiques postcoloniales examinent la littérature à travers le prisme des dynamiques de pouvoir impérial. La théorie littéraire féministe interroge les représentations de genre, et les humanités numériques emploient désormais des méthodes computationnelles pour analyser de vastes corpus textuels. Ces méthodologies diverses reflètent l\'adaptation du domaine aux paysages intellectuels et culturels changeants.',
          question: language === 'english' ? 'What does the diversity of literary criticism methodologies demonstrate?' : 'Que démontre la diversité des méthodologies de critique littéraire?',
          options: language === 'english' ? 
            ['The superiority of newer approaches', 'The field\'s adaptation to changing contexts', 'The decline of traditional analysis', 'The need for standardized methods'] : 
            ['La supériorité des approches plus récentes', 'L\'adaptation du domaine aux contextes changeants', 'Le déclin de l\'analyse traditionnelle', 'Le besoin de méthodes standardisées'],
          correctAnswer: 1
        },
        {
          id: 3,
          text: language === 'english' ? 
            'The microbiome comprises trillions of microorganisms residing within the human body that significantly influence physiological processes. Recent research has established correlations between gut microbial composition and various health conditions, including inflammatory disorders, metabolic syndromes, and even neurological states. This emerging understanding suggests potential therapeutic interventions targeting the microbiome, although translating laboratory findings to clinical applications presents considerable challenges due to the microbiome\'s complexity and individual variability.' : 
            'Le microbiome comprend des billions de micro-organismes résidant dans le corps humain qui influencent significativement les processus physiologiques. Des recherches récentes ont établi des corrélations entre la composition microbienne intestinale et diverses conditions de santé, y compris les troubles inflammatoires, les syndromes métaboliques, et même les états neurologiques. Cette compréhension émergente suggère des interventions thérapeutiques potentielles ciblant le microbiome, bien que la traduction des résultats de laboratoire aux applications cliniques présente des défis considérables en raison de la complexité du microbiome et de la variabilité individuelle.',
          question: language === 'english' ? 'What challenge exists in developing microbiome-based treatments?' : 'Quel défi existe dans le développement de traitements basés sur le microbiome?',
          options: language === 'english' ? 
            ['Insufficient research funding', 'Microbiome complexity and individual differences', 'Lack of interest from pharmaceutical companies', 'Regulatory obstacles'] : 
            ['Financement insuffisant de la recherche', 'Complexité du microbiome et différences individuelles', 'Manque d\'intérêt des entreprises pharmaceutiques', 'Obstacles réglementaires'],
          correctAnswer: 1
        }
      ]
    };
    
    // If level not found, default to A1 or closest available
    const levelQuestions = questionsByLevel[level] || questionsByLevel['a1'];
    
    // Create a deep copy to avoid state mutation issues
    return JSON.parse(JSON.stringify(levelQuestions));
  };

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const score = calculateScore();
    const results = {
      type: 'reading',
      level: level,
      language: language,
      score: score.percentage,
      correctAnswers: score.correct,
      totalQuestions: questions.length,
      timeSpent: getTimeLimitByLevel(level) - timeLeft,
      cefr: CEFRService.calculateCEFRResult(score.percentage, level),
      answers: answers,
      feedback: CEFRService.generateFeedback(score.percentage, level, 'reading')
    };

    onComplete(results);
  };

  const calculateScore = () => {
    let correct = 0;
    
    answers.forEach((answer, index) => {
      if (index < questions.length && answer === questions[index].correctAnswer) {
        correct++;
      }
    });
    
    const percentage = (correct / questions.length) * 100;
    
    return {
      correct,
      percentage
    };
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading || !questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#592538] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#592538]">
            {language === 'english' ? 'Reading Assessment' : 'Évaluation de Lecture'} - {level.toUpperCase()}
          </h2>
          <div className="text-right">
            <div className="text-gray-600 mb-1">
              {language === 'english' ? 'Time Remaining:' : 'Temps Restant:'} <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-gray-600">
              {language === 'english' ? 'Question' : 'Question'} {currentQuestion + 1}/{questions.length}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-gray-800 mb-4">{questions[currentQuestion].text}</p>
          <p className="text-[#592538] font-medium">{questions[currentQuestion].question}</p>
        </div>

        <div className="space-y-3 mb-6">
          {questions[currentQuestion].options.map((option, index) => (
            <div
              key={index}
              className={`p-3 border rounded cursor-pointer ${
                answers[currentQuestion] === index
                  ? 'border-[#592538] bg-[#592538]/10'
                  : 'border-gray-300 hover:border-[#592538]/50'
              }`}
              onClick={() => handleAnswer(index)}
            >
              <div className="flex items-center">
                <div className={`h-5 w-5 rounded-full mr-3 flex items-center justify-center border ${
                  answers[currentQuestion] === index
                    ? 'bg-[#592538] border-[#592538]'
                    : 'border-gray-400'
                }`}>
                  {answers[currentQuestion] === index && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded-lg ${
              currentQuestion === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {language === 'english' ? 'Previous' : 'Précédent'}
          </button>
          
          <div>
            <button
              onClick={onBack}
              className="px-4 py-2 mx-2 text-[#592538] border border-[#592538] rounded-lg hover:bg-[#592538]/10"
            >
              {language === 'english' ? 'Exit' : 'Quitter'}
            </button>
            
            <button
              onClick={currentQuestion === questions.length - 1 ? handleSubmit : handleNextQuestion}
              className="px-6 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44]"
              disabled={answers[currentQuestion] === undefined}
            >
              {currentQuestion === questions.length - 1 
                ? (language === 'english' ? 'Submit' : 'Soumettre')
                : (language === 'english' ? 'Next' : 'Suivant')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingAssessment; 