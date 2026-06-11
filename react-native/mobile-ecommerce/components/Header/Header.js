import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Appbar, Divider, List, Searchbar, Text } from "react-native-paper";
import { wixCient } from "../../authentication/wixClient";
import Routes from "../../routes/routes";
import { styles } from "../../styles/home/header/styles";
import { WixMediaImage } from "../../WixMediaImage";
import { LoadingIndicator } from "../LoadingIndicator/LoadingIndicator";

const HeaderContent = ({ handleShowResults, showResults, searchRef }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const productsResponse = useQuery(["products"], () =>
    wixCient.products.queryProducts().find(),
  );
  useEffect(() => {
    if (!productsResponse.isLoading && productsResponse?.data?.items) {
      setFilteredProducts(productsResponse.data.items);
    }
  }, [productsResponse?.data?.items]);

  const onSearchChange = (query) => {
    setSearchQuery(query);
    handleShowResults(true);
    setFilteredProducts(
      productsResponse.data?.items?.filter((product) =>
        product.name.toLowerCase().startsWith(query.toLowerCase()),
      ),
    );
  };

  const redirectToProduct = (product) => {
    handleShowResults(false);
    navigation.navigate(Routes.Product, {
      product,
      collectionName: product.name,
    });
  };
  return (
    <View style={styles.header_content}>
      <Text style={styles.header_title}>R.V</Text>
      <View style={styles.header_searchBox}>
        <Searchbar
          placeholder="Search..."
          onChangeText={onSearchChange}
          value={searchQuery}
          mode={"view"}
          style={styles.searchContainer}
          inputStyle={styles.searchInput}
          theme={{ colors: { primary: "#403F2B" } }}
          showDivider={false}
          elevation={0}
          ref={searchRef}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          onFocus={() => {
            handleShowResults(true);
            searchRef?.current?.focus();
          }}
          onBlur={() => {
            handleShowResults(searchQuery.length > 0);
            searchRef?.current?.blur();
          }}
          onClearIconPress={() => {
            !searchRef?.current?.isFocused() && handleShowResults(false);
          }}
        />
        {showResults &&
          (!productsResponse.isLoading && productsResponse?.data?.items ? (
            searchQuery.length > 0 && (
              <ScrollView
                style={styles.searchResultsContainer}
                nestedScrollEnabled={true}
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product, i) => (
                    <View key={i}>
                      <List.Item
                        key={i}
                        title={
                          <View style={styles.searchResultItem}>
                            <View>
                              <WixMediaImage
                                media={product.media.mainMedia.image.url}
                                width={100}
                                height={100}
                              >
                                {({ url }) => {
                                  return (
                                    <Image
                                      style={[
                                        styles.image,
                                        {
                                          width: 30,
                                          height: 30,
                                        },
                                      ]}
                                      source={{
                                        uri: url,
                                      }}
                                    />
                                  );
                                }}
                              </WixMediaImage>
                            </View>
                            <Text
                              style={styles.productName}
                              numberOfLines={null}
                            >
                              {product.name}
                            </Text>
                          </View>
                        }
                        onPress={redirectToProduct.bind(this, product)}
                      />
                      {i < filteredProducts.length - 1 && (
                        <Divider
                          style={{ backgroundColor: "#ccc", opacity: 0.6 }}
                        />
                      )}
                    </View>
                  ))
                ) : (
                  <List.Item
                    titleStyle={styles.searchResultItem}
                    key={0}
                    title={<Text>No results found</Text>}
                  />
                )}
              </ScrollView>
            )
          ) : (
            <View style={styles.searchResultsContainer}>
              <LoadingIndicator />
            </View>
          ))}
      </View>
    </View>
  );
};

export function Header({ handleShowResults, showResults, searchRef }) {
  return (
    <View style={styles.view}>
      <Appbar.Header style={styles.header}>
        <HeaderContent
          handleShowResults={handleShowResults}
          showResults={showResults}
          searchRef={searchRef}
        />
      </Appbar.Header>
    </View>
  );
}
