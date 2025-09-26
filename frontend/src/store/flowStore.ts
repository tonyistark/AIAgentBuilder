import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import axios from 'axios';

interface FlowState {
  flowId: string | null;
  flowName: string;
  nodes: Node[];
  edges: Edge[];
  isLoading: boolean;
  
  // Actions
  setFlowId: (id: string | null) => void;
  setFlowName: (name: string) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: any) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  saveFlow: () => Promise<void>;
  loadFlow: (flowId: string) => Promise<void>;
  runFlow: () => Promise<void>;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  flowId: null,
  flowName: 'Untitled Flow',
  nodes: [],
  edges: [],
  isLoading: false,

  setFlowId: (id) => set({ flowId: id }),
  setFlowName: (name) => set({ flowName: name }),
  
  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
  
  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
    ),
  })),
  
  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== nodeId),
    edges: state.edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    ),
  })),
  
  addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
  
  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== edgeId),
  })),
  
  saveFlow: async () => {
    const { flowId, flowName, nodes, edges } = get();
    const flowData = {
      name: flowName,
      data: { nodes, edges },
    };
    
    try {
      if (flowId) {
        await axios.put(`/api/v1/flows/${flowId}`, flowData);
      } else {
        const response = await axios.post('/api/v1/flows', flowData);
        set({ flowId: response.data.id });
      }
    } catch (error) {
      console.error('Failed to save flow:', error);
      throw error;
    }
  },
  
  loadFlow: async (flowId: string) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/api/v1/flows/${flowId}`);
      const { name, data } = response.data;
      set({
        flowId,
        flowName: name,
        nodes: data.nodes || [],
        edges: data.edges || [],
      });
    } catch (error) {
      console.error('Failed to load flow:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  runFlow: async () => {
    const { flowId, nodes, edges } = get();
    
    if (!flowId) {
      // Save flow first if not saved
      await get().saveFlow();
    }
    
    try {
      const response = await axios.post(`/api/v1/flows/${get().flowId}/run`, {
        inputs: {},
        context: {},
      });
      return response.data;
    } catch (error) {
      console.error('Failed to run flow:', error);
      throw error;
    }
  },
}));
