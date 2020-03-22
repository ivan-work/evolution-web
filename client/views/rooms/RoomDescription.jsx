import React from 'react';
import T from 'i18n-react';
import RoomCardCounter from "./settings/RoomCardCounter";

export default ({room}) => {
  return (
    <div>
      <div>
        <RoomCardCounter settings={room.settings} />
      </div>
      {room.settings.seed && (
        <div>{T.translate('App.Room.Desc.Seeded')}</div>
      )}
    </div>
  );
}