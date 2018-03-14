import Ember from 'ember';

const { isArray } = Ember;

export default Ember.Mixin.create({
  updateRelationship(relationship) {
    return this.save({
      adapterOptions: { relationshipToUpdate: relationship }
    });
  },

  addToRelationship(relationship, data) {
    return this.save({
      adapterOptions: {
        relationshipToUpdate: relationship,
        data,
        requestType: 'createRelationship'
      }
    })
    .then(() => {
      const relationshipKind = this.relationshipFor(relationship).kind;

      if(relationshipKind === 'hasMany' && isArray(data)) {
        this.get(relationship).pushObjects(data);
      } else if (relationshipKind === 'hasMany' && !isArray(data)){
        this.get(relationship).pushObject(data);
      } else {
        throw new Error('Wrong data or relationship to add.');
      }
    });
  },

  removeFromRelationship(relationship, data) {
    return this.save({
      adapterOptions: {
        relationshipToUpdate: relationship,
        data,
        requestType: 'deleteRelationship'
      }
    })
    .then(() => {
      const relationshipKind = this.relationshipFor(relationship).kind;

      if(relationshipKind === 'hasMany' && isArray(data)) {
        this.get(relationship).removeObjects(data);
      } else if (relationshipKind === 'hasMany' && !isArray(data)){
        this.get(relationship).removeObject(data);
      } else {
        throw new Error('Wrong data or relationship to remove.');
      }
    });
  },
});
