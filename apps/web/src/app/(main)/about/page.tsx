import React from 'react';
import { 
  CheckSquare, 
  ListOrdered, 
  GitFork, 
  Binary, 
  Star, 
  Award, 
  BarChart3 
} from 'lucide-react';

interface AlgorithmCardProps {
  title: string;
  description: string;
  listLabel: string;
  items: string[];
  Icon: React.ComponentType<{ className?: string }>;
}

const AlgorithmCard: React.FC<AlgorithmCardProps> = ({ title, description, listLabel, items, Icon }) => {
  return (
    <div className="bg-green-50/40 border-2 border-green-700/30 rounded-2xl p-8 shadow-md shadow-orange-500/5 transition-all duration-200 hover:shadow-lg hover:border-green-700/60 flex flex-col md:flex-row justify-between gap-6 items-start relative overflow-hidden">
      <div className="flex-1 space-y-5 w-full">
        <div>
          <h2 className="text-2xl font-mono font-bold text-green-900 tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-gray-700 font-sans text-base leading-relaxed max-w-4xl">
            {description}
          </p>
        </div>

        <div className="bg-orange-50/60 rounded-xl p-5 border border-orange-200/60 w-full">
          <span className="block font-mono font-bold text-xs uppercase tracking-wider text-orange-700 mb-3">
            {listLabel}:
          </span>
          <ul className="space-y-2.5">
            {items.map((item, idx) => (
              <li key={idx} className="text-gray-800 font-sans text-sm flex items-start gap-3">
                <span className="text-orange-500 mt-1 select-none font-mono text-xs">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-green-700 p-2.5 bg-green-100/60 rounded-xl md:self-start self-end border border-green-700/20">
        <Icon className="w-9 h-9 stroke-[2]" />
      </div>
    </div>
  );
};

export default function AboutVotingAlgorithms() {
  const algorithms = [
    {
      title: "General Voting (First Past the Post)",
      description: "The most common voting system where voters select one candidate, and the candidate with the most votes wins. Simple but may not always reflect the true preference of the majority.",
      listLabel: "Key Features",
      items: [
        "One person, one vote principle",
        "Winner takes all system format",
        "Extremely simple to understand, tally, and implement securely"
      ],
      Icon: CheckSquare
    },
    {
      title: "Ranked Choice Voting (IRV)",
      description: "Voters rank candidates in order of preference. If no candidate receives an absolute majority, the lowest-ranked candidate is eliminated, and their votes are redistributed dynamically.",
      listLabel: "Process Flow",
      items: [
        "Rank candidates sequentially (1st, 2nd, 3rd...)",
        "Eliminate lowest-ranked choice if no absolute majority exists",
        "Redistribute alternative votes until a winner is securely achieved"
      ],
      Icon: ListOrdered
    },
    {
      title: "Schulze Method",
      description: "A highly sophisticated ranked choice method that compares all possible pairs of candidates to discover the strongest path of victory between choices.",
      listLabel: "Characteristics",
      items: [
        "Strictly satisfies the Condorcet criterion",
        "Provides a highly resilient path comparison matrix system",
        "Extremely popular within distributed tech and open-source networks"
      ],
      Icon: GitFork
    },
    {
      title: "Quadratic Voting",
      description: "Allows voters to express the depth of their preferences using finite vote credits, where the budget cost increases quadratically with every additional vote.",
      listLabel: "Mathematical Benefits",
      items: [
        "Accurately measures the sheer intensity of stakeholder preference",
        "Protects minority interests and completely avoids vote splitting",
        "Mathematically optimized for complex allocative community decisions"
      ],
      Icon: Binary
    },
    {
      title: "Score Voting",
      description: "Voters grade each candidate independently on a designated numeric scale. The candidate achieving the highest cumulative average score wins.",
      listLabel: "Core Advantages",
      items: [
        "Enables extremely nuanced continuous expression of sentiment",
        "Highly straightforward to compute on distributed databases",
        "Substantially reduces systemic tactical/strategic voting vulnerabilities"
      ],
      Icon: Star
    },
    {
      title: "Kemeny-Young Method",
      description: "Finds an optimal consensus sequence ordering that mathematically minimizes the aggregate disagreement with every individual voter's full ranking.",
      listLabel: "Features",
      items: [
        "Acts as a pairwise maximum likelihood estimator",
        "Fully evaluates complex voter preference cycles",
        "Computationally intensive tracking handled gracefully via custom calculators"
      ],
      Icon: Award
    },
    {
      title: "Moore's Voting",
      description: "An optimization layout variant focusing on isolating dominant Condorcet options safely using strict majority-candidate elimination sweeps.",
      listLabel: "Key Evaluation Points",
      items: [
        "Systematically eliminates low-consensus options early",
        "Strives for an uncompromised structural consensus winner",
        "Balances computational complexity against ballot legibility constraints"
      ],
      Icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-gray-900 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* About Section Header - Create Button Link Removed */}
        <header className="pt-12 pb-10">
          <div className="space-y-3 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-mono font-bold leading-[1.1] tracking-tight text-green-900">
              Voting Algorithms
            </h1>
            <p className="text-orange-800 font-sans text-lg font-medium leading-relaxed">
              Explore different ballot styles and understand how cryptographic mechanisms shape decentralized choice.
            </p>
          </div>
        </header>

        {/* Dynamic Card Container List */}
        <main className="space-y-6">
          {algorithms.map((algo, index) => (
            <AlgorithmCard 
              key={index}
              title={algo.title}
              description={algo.description}
              listLabel={algo.listLabel}
              items={algo.items}
              Icon={algo.Icon}
            />
          ))}
        </main>

      </div>
    </div>
  );
}