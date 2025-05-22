import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));

}


export function camelToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeCase);
  }

  if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const snakeKey = key
        .replace(/([A-Z])/g, "_$1")
        .toLowerCase();

      acc[snakeKey] = camelToSnakeCase(value);
      return acc;
    }, {} as Record<string, any>);
  }

  return obj;
}

export function snakeToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelCase);
  }

  if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = snakeToCamelCase(value);
      return acc;
    }, {} as Record<string, any>);
  }

  return obj;
}


/**
 * Connects objects in a main array to objects in various linked arrays based on specified relationships.
 *
 * @template TMain - The type of objects in the mainArray.
 * @param {Array<TMain>} mainArray - The array of objects to which linked objects will be added.
 * @param {Record<string, Record<string, any>[]>} linkedData - An object where keys are names (e.g., "departments", "managers")
 * and values are arrays of objects that will be linked to the main array.
 * @param {Array<{mainKey: keyof TMain, sourceArrayName: string, linkedKey: string, newPropertyName: string}>} relationships - An array
 * defining how to link the arrays. Each object in this array should have:
 * - `mainKey`: The property name in the `mainArray` object to use for linking (e.g., 'departmentId').
 * - `sourceArrayName`: The key in the `linkedData` object that points to the array containing the linked objects (e.g., 'departments').
 * - `linkedKey`: The property name in the linked object (from `linkedData[sourceArrayName]`) to use for matching (e.g., 'id').
 * - `newPropertyName`: The name of the new property to add to the `mainArray` object,
 * which will hold the connected linked object (e.g., 'department').
 * @returns {Array<TMain & Record<string, any | undefined>>} A new array with objects from `mainArray` augmented with
 * the connected linked objects, or an empty array if inputs are invalid.
 */
export function connectArrays<TMain extends Record<string, any>>(
  mainArray: TMain[],
  linkedData: Record<string, Record<string, any>[]>,
  relationships: Array<{ mainKey: keyof TMain; sourceArrayName: string; linkedKey: string; newPropertyName: string }>
): Array<TMain & Record<string, any | undefined>> {
  // Basic input validation
  if (!Array.isArray(mainArray) || typeof linkedData !== 'object' || linkedData === null || Array.isArray(linkedData) || !Array.isArray(relationships)) {
    console.error("Invalid input: mainArray and relationships must be arrays, linkedData must be an object.");
    return [];
  }

  // Create a Map for each specified linkedKey within each source array for efficient lookups.
  // This step runs once and has a time complexity proportional to the total number of items in linkedData arrays.
  const linkedMaps: Record<string, Record<string, Map<any, any>>> = {}; // sourceArrayName -> linkedKey -> Map

  for (const sourceArrayName in linkedData) {
    if (Object.prototype.hasOwnProperty.call(linkedData, sourceArrayName)) {
      const currentLinkedArray = linkedData[sourceArrayName];
      if (!Array.isArray(currentLinkedArray)) {
        console.warn(`linkedData['${sourceArrayName}'] is not an array and will be skipped.`);
        continue;
      }

      // Initialize the inner object for this sourceArrayName if it doesn't exist
      if (!linkedMaps[sourceArrayName]) {
        linkedMaps[sourceArrayName] = {};
      }

      // Filter relationships relevant to this sourceArrayName to build specific maps
      const relevantRelationships = relationships.filter(rel => rel.sourceArrayName === sourceArrayName);

      relevantRelationships.forEach(rel => {
        // Build a map for this specific linkedKey within this sourceArrayName
        if (!linkedMaps[sourceArrayName][rel.linkedKey]) {
          linkedMaps[sourceArrayName][rel.linkedKey] = new Map<any, any>();
          currentLinkedArray.forEach(item => {
            if (item.hasOwnProperty(rel.linkedKey)) {
              linkedMaps[sourceArrayName][rel.linkedKey].set(item[rel.linkedKey], item);
            }
          });
        }
      });
    }
  }

  // Iterate over the mainArray and apply all specified connections.
  // This step has a time complexity of O(M * R) where M is the length of mainArray
  // and R is the number of relationships. Lookups in the map are O(1) on average.
  const connectedMainArray = mainArray.map(mainItem => {
    // Create a shallow copy of the mainItem to avoid mutating the original array
    const newMainItem: TMain & Record<string, any | undefined> = { ...mainItem };

    relationships.forEach(rel => {
      const mainValue = newMainItem[rel.mainKey];
      // Access the specific map for this sourceArrayName and linkedKey
      const linkedMap = linkedMaps[rel.sourceArrayName]?.[rel.linkedKey];

      // Ensure the mainKey exists in the mainItem and the corresponding map exists
      if (mainValue !== undefined && linkedMap) {
        const foundLinkedItem: any | undefined = linkedMap.get(mainValue);
        if (foundLinkedItem) {

          //@ts-ignore
          newMainItem[rel.newPropertyName] = foundLinkedItem;
        }
      }
    });
    return newMainItem;
  });

  return connectedMainArray;
}
