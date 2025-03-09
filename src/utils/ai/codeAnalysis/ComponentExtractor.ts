
export class ComponentExtractor {
  // Mock implementation to fix build errors
  static extractComponents(source: string): any[] {
    return [];
  }
  
  static getComponentName(declaration: any): string {
    return "UnknownComponent";
  }
  
  static extractProps(source: string): any[] {
    return [];
  }
}
