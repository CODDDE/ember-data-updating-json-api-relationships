import Ember from 'ember';

let { Controller, computed, computed: { alias } } = Ember;

export default Controller.extend({
  article: alias('model'),
  tags: computed(function() {
    return this.store.peekAll('tag');
  }),
  actions: {
    saveTagsToArticle(article) {
      article.updateRelationship('tags');
    },
    addTag(article, tag) {
      article.get('tags').pushObject(tag);
    },
    addAuthor(article) {
      article.set('author', this.store.peekRecord('author', 1));
      article.updateRelationship('author');
    }
  }
});
