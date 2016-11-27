import React, { Component } from 'react';
import Paper from 'material-ui/Paper';

import ComponentSearchBar from './ComponentSearchBar';
import ComponentSearchResults from './ComponentSearchResults';

import './ComponentSearcher.css';

export default class ComponentSearcher extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      searchResults: []
    };
    this._onSearchTextChange = this._onSearchTextChange.bind(this);
    this._onSelectSearchResult = this._onSelectSearchResult.bind(this);
  }

  _onSearchTextChange(updatedText) {
    this.setState({
      searchText: updatedText,
      searchResults: filterSearchResults(this.props.components, updatedText)
    });
  }

  _onSelectSearchResult(component) {
    this.setState({
      searchText: '',
      searchResults: []
    });
    this.props.onSelect(component);
  }

  render() {
    const { searchText, searchResults } = this.state;
    return (
      <div className="ComponentSearcher">
        <Paper zDepth={2} className="content">
          <ComponentSearchBar
            searchText={searchText}
            onSearchTextChange={this._onSearchTextChange}
          />
          {searchResults.length === 0 ? null : (
            <ComponentSearchResults
              results={searchResults}
              onSelect={this._onSelectSearchResult}
            />
          )}
        </Paper>
      </div>
    );
  }
};

function filterSearchResults(components, searchText) {
  if (searchText.length === 0) return [];

  return components.filter(component => (
    contains(component.name, searchText) ||
    contains(component.path, searchText) ||
    contains(component.type, searchText)
  ));
}

function contains(searchString, substring) {
  return (searchString.toLowerCase().indexOf(substring.toLowerCase()) !== -1);
}
