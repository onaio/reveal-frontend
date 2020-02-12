import React from 'react';

export class ObjectList {
  public component: React.ElementType;

  constructor(component: React.ElementType) {
    this.component = component;
  }

  public render() {
    return this.component;
  }
}
