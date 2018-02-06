import DS from 'ember-data';
import { pluralize } from 'ember-inflector';

export default DS.JSONAPIAdapter.extend({
  urlForUpdateRecord(id, modelName, snapshot) {
    let { adapterOptions } = snapshot;
    if (this.urlForUpdateRelationship && adapterOptions) {
      return this.urlForUpdateRelationship(id, modelName, snapshot, adapterOptions.relationshipToUpdate);
    }

    let originalUpdateURL = this._super(...arguments);
    if (adapterOptions && adapterOptions.relationshipToUpdate) {
      let { relationshipToUpdate } = adapterOptions;
      let relationship = this._getRelationship(relationshipToUpdate, snapshot);
      let path = this._normalizeRelationshipPath(relationship.type, relationship.kind);
      return `${originalUpdateURL}/relationships/${path}`;
    }

    return originalUpdateURL;
  },

  serializeIdType(data) {
    let json = {};
    const id = data.id;
    const type = pluralize(data.constructor.modelName);
    if (id) {
      json['id'] = id;
    }
    if (type) {
      json['type'] = type;
    }
    return json;
  },

  createPayload(snapshot) {
    let payload;
    const { adapterOptions } = snapshot;
    let { data } = adapterOptions;
    const { relationshipToUpdate } = adapterOptions;
    const relationship = this._getRelationship(relationshipToUpdate, snapshot);

    if(relationship.kind === 'hasMany') {
      payload = [];

      if(data.length) {
        data.forEach((objectModel) => {
          payload.pushObject(this.serializeIdType(objectModel));
        });
      }
      else {
        payload.pushObject(this.serializeIdType(data));
      }
      return {
        'data': payload
      };
    }
    else if(relationship.kind === 'belongsTo' && data.length){
      throw new Error('Invalid received data: Array Object is not allowed to add in a belongsTo relationship');
    }
    payload = this.serializeIdType(adapterOptions.data);
    return payload;
  },

  updateRecord(store, type, snapshot) {
    let { adapterOptions } = snapshot;

    if (adapterOptions && adapterOptions.relationshipToUpdate) {

      const data = this.createPayload(snapshot);
      let url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');
      if(adapterOptions.requestType === 'createRelationship') {
        return this.ajax(url, "POST", { data })
          .then(() => null );
      }
      else if(adapterOptions.requestType === 'deleteRelationship') {
        return this.ajax(url, "DELETE", { data })
          .then(() => null );
      }
    }
    else {
      let promise = this._super(...arguments);
      if (adapterOptions && adapterOptions.relationshipToUpdate) {
        return promise.then(() => {
          return null;
        });
      }
      return promise;
    }
  },

  _getRelationship(relationshipToUpdate, snapshot) {
    let relationshipDescriptor;
    snapshot.eachRelationship((name, relationship) => {
      if (name === relationshipToUpdate) {
        relationshipDescriptor = relationship;
      }
    });

    return relationshipDescriptor;
  },
  _normalizeRelationshipPath(type, relationshipKind) {
    if (relationshipKind === 'hasMany') {
      return pluralize(type);
    }

    return type;
  }
});
