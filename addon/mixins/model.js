import Ember from 'ember';

export default Ember.Mixin.create({
  updateRelationship(relationship) {
    return this.save({
      adapterOptions: { relationshipToUpdate: relationship }
    });
  },

  addRelationship(relationship, data) {
    return this.save({
      adapterOptions: {
        relationshipToUpdate: relationship,
        data,
        requestType: 'createRelationship'
      }
    })
  },

  removeRelationship(relationship, data) {
    return this.save({
      adapterOptions: {
        relationshipToUpdate: relationship,
        data,
        requestType: 'deleteRelationship'
      }
    })
  },
});
