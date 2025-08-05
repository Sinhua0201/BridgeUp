import { useState, useCallback } from "react";
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType 
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

export default function CareerNavigator() {
  const [major, setMajor] = useState("");
  const [interest, setInterest] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState("");

  // API configuration
  const geminiApiKey = "AIzaSyDBRv5zQhIS0bMVyIc1xIfvXYMn286R1kk";
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  // Node styles based on level
  const getNodeStyle = (level, nodeType = 'default') => {
    const baseStyle = {
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      minWidth: '140px',
      textAlign: 'center',
      border: '2px solid',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: 'all 0.3s ease'
    };

    switch (level) {
      case 0: // Root node
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          borderColor: '#5a67d8',
          fontSize: '16px',
          fontWeight: '700',
          minWidth: '180px'
        };
      case 1: // Category nodes
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#ffffff',
          borderColor: '#ed64a6',
          fontSize: '15px'
        };
      case 2: // Item nodes
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: '#ffffff',
          borderColor: '#4299e1'
        };
      default: // Deep level nodes
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: '#1a202c',
          borderColor: '#48bb78'
        };
    }
  };

  const handleGenerateCareerMap = async () => {
    if (!major.trim() || !interest.trim() || !industry.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setNodes([]);
    setEdges([]);

    try {
      const prompt = `
You are an AI career advisor for Malaysian university students.

🎯 Student Profile:
- Major: ${major}
- Interests: ${interest}
- Target Industry: ${industry}

Generate a comprehensive career mindmap in JSON format. Include:
1. Career Paths (3-5 specific job roles)
2. Required Skills (technical & soft skills)
3. Certifications (relevant certifications)
4. Companies (Malaysian companies in this field)
5. Growth Path (junior to senior progression)

Format as valid JSON only:
{
  "name": "Career Roadmap",
  "children": [
    {
      "name": "Career Paths",
      "children": [
        {"name": "Software Engineer"},
        {"name": "Data Scientist"},
        {"name": "Product Manager"}
      ]
    },
    {
      "name": "Technical Skills",
      "children": [
        {"name": "Programming"},
        {"name": "Database Management"},
        {"name": "Cloud Computing"}
      ]
    },
    {
      "name": "Soft Skills",
      "children": [
        {"name": "Communication"},
        {"name": "Leadership"},
        {"name": "Problem Solving"}
      ]
    },
    {
      "name": "Certifications",
      "children": [
        {"name": "AWS Certified"},
        {"name": "Google Analytics"},
        {"name": "Project Management"}
      ]
    },
    {
      "name": "Top Companies",
      "children": [
        {"name": "Grab"},
        {"name": "Genting"},
        {"name": "Public Bank"}
      ]
    }
  ]
}

Return only valid JSON, no markdown or extra text.
      `;

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (!text) {
        setError("Failed to generate career map. Please try again.");
        setLoading(false);
        return;
      }

      let parsedTree;
      try {
        parsedTree = JSON.parse(text);
      } catch (err) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedTree = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Invalid response format");
        }
      }

      convertTreeToGraph(parsedTree);

    } catch (err) {
      console.error("API Error:", err);
      setError("Failed to generate career map. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  const convertTreeToGraph = (tree) => {
    let nodeId = 1;
    const rawNodes = [];
    const rawEdges = [];
    const nodeMap = new Map(); // Track node levels

    function traverse(node, parentId = null, level = 0) {
      const id = nodeId.toString();
      nodeMap.set(id, level);
      
      rawNodes.push({
        id,
        data: { label: node.name },
        position: { x: 0, y: 0 },
        style: getNodeStyle(level),
        type: 'default'
      });
      nodeId++;

      if (parentId) {
        rawEdges.push({ 
          id: `e${parentId}-${id}`, 
          source: parentId, 
          target: id,
          type: 'smoothstep',
          animated: level <= 1,
          style: { 
            stroke: level === 0 ? '#667eea' : level === 1 ? '#f093fb' : '#4facfe',
            strokeWidth: level === 0 ? 3 : 2
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: level === 0 ? '#667eea' : level === 1 ? '#f093fb' : '#4facfe'
          }
        });
      }

      if (node.children) {
        node.children.forEach((child) => traverse(child, id, level + 1));
      }
    }

    traverse(tree);

    // Enhanced dagre layout
    const g = new dagre.graphlib.Graph();
    g.setGraph({ 
      rankdir: "LR", 
      nodesep: 80, 
      ranksep: 120,
      marginx: 50,
      marginy: 50
    });
    g.setDefaultEdgeLabel(() => ({}));

    rawNodes.forEach((node) => {
      const level = nodeMap.get(node.id);
      const width = level === 0 ? 200 : level === 1 ? 160 : 140;
      const height = level === 0 ? 60 : 50;
      g.setNode(node.id, { width, height });
    });

    rawEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    const laidOutNodes = rawNodes.map((node) => {
      const nodeWithPos = g.node(node.id);
      const level = nodeMap.get(node.id);
      const width = level === 0 ? 200 : level === 1 ? 160 : 140;
      
      return {
        ...node,
        position: {
          x: nodeWithPos.x - width / 2,
          y: nodeWithPos.y - 25,
        },
      };
    });

    setNodes(laidOutNodes);
    setEdges(rawEdges);
  };

  const onNodeClick = useCallback((event, node) => {
    console.log('Node clicked:', node.data.label);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="pt-8 pb-6 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
          AI Career Navigator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Discover your career path with AI-powered insights. Enter your details below to generate 
          a personalized career roadmap with skills, companies, and growth opportunities.
        </p>
      </div>

      {/* Input Form */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🎓 Academic Major
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science, Business, Engineering"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ❤️ Core Interests
              </label>
              <input
                type="text"
                placeholder="e.g. Data Analysis, Design, Marketing"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🏢 Target Industry
              </label>
              <input
                type="text"
                placeholder="e.g. Technology, Finance, Healthcare"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateCareerMap}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Career Map...
              </span>
            ) : (
              "✨ Generate My Career Roadmap"
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Career Map Visualization */}
      {nodes.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-white/20">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <h2 className="text-2xl font-bold">Your Career Roadmap</h2>
              <p className="text-blue-100 mt-1">Interactive career path visualization</p>
            </div>
            
            <div style={{ width: "100%", height: "700px" }}>
              <ReactFlow 
                nodes={nodes} 
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.3}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              >
                <MiniMap 
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  nodeColor={(node) => {
                    if (node.style?.background?.includes('667eea')) return '#667eea';
                    if (node.style?.background?.includes('f093fb')) return '#f093fb';
                    if (node.style?.background?.includes('4facfe')) return '#4facfe';
                    return '#43e97b';
                  }}
                />
                <Controls 
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Background 
                  color="#e2e8f0" 
                  gap={20} 
                  size={1}
                  variant="dots"
                />
              </ReactFlow>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}