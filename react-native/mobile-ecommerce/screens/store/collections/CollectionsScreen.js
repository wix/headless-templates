import { useQuery } from "@tanstack/react-query";
import { wixCient } from "../../../authentication/wixClient";
import { SimpleContainer } from "../../../components/Container/SimpleContainer";
import { ErrorView } from "../../../components/ErrorView/ErrorView";
import { CollectionsGrid } from "../../../components/Grid/CollectionsGrid";
import { LoadingIndicator } from "../../../components/LoadingIndicator/LoadingIndicator";
import Routes from "../../../routes/routes";

export const CollectionsScreen = ({ navigation }) => {
  const collectionsResponse = useQuery(["collections"], () =>
    wixCient.collections.queryCollections().find(),
  );
  if (collectionsResponse.isLoading) {
    return (
      <SimpleContainer
        navigation={navigation}
        title={"Collections"}
        backIcon={false}
      >
        <LoadingIndicator />
      </SimpleContainer>
    );
  }

  if (collectionsResponse.isError) {
    return <ErrorView message={collectionsResponse.error.message} />;
  }

  const collectionPressHandler = (items) => {
    navigation.navigate(Routes.Products, { items });
  };

  return (
    <SimpleContainer
      navigation={navigation}
      title={"Collections"}
      backIcon={false}
    >
      <CollectionsGrid
        data={collectionsResponse.data._items}
        onPress={collectionPressHandler}
      />
    </SimpleContainer>
  );
};
