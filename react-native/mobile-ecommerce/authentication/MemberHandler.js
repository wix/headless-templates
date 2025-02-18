import * as React from "react";
import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";

const MemberHandlerContext = React.createContext(null);

export function useMemberHandler() {
  return React.useContext(MemberHandlerContext);
}

export function MemberHandler(props) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [currentMember, setCurrentMember] = React.useState(null);

  const updateContact = React.useCallback(async (contact) => {
    setFirstName(contact.firstName || firstName);
    setLastName(contact.lastName || lastName);
    setPhone(contact.phone || phone);
  }, []);

  return (
    <MemberHandlerContext.Provider
      value={{ updateContact, currentMember, firstName, lastName, phone }}
    >
      {props.children}
    </MemberHandlerContext.Provider>
  );
}
