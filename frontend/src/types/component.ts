export type DataType = 
  | 'Text'
  | 'Number'
  | 'Boolean'
  | 'Data'
  | 'DataFrame'
  | 'Embeddings'
  | 'LanguageModel'
  | 'Memory'
  | 'Message'
  | 'Tool'
  | 'VectorStore'
  | 'Any';

export interface PortType {
  id: string;
  name: string;
  display_name: string;
  type: DataType;
  description?: string;
  required: boolean;
  multiple: boolean;
  default?: any;
  options?: any[];
  advanced: boolean;
}

export interface ComponentType {
  name: string;
  display_name: string;
  description: string;
  category: string;
  icon: string;
  version: string;
  inputs: PortType[];
  outputs: PortType[];
}
